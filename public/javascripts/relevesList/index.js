'use strict';


angular.module('CompteApp', [])
    .factory('StatsService', ['$rootScope', function($rootScope){

        function createHistory(releves) {
            var lineData = [];
            for (var i = 1; i <= 31; i++) {
                var r = _.filter(releves, function (releve) {
                    var jour = new Date(releve.date).getDate();
                    return i >= jour;
                });
                var v = _.map(r, function (releve) {
                    if (releve.debit) return -releve.amount;
                    else return releve.amount
                });
                var value = _.reduce(v, function (a, b) {
                    return a + b;
                }, 0);
                lineData.push({x: i, y: value})
            }
            return lineData;
        }

        function createPie(releves) {
            var categories = ["Home", "BillsAndUtilities", "FoodAndDrinks", "Shopping", "AutoAndTransport", "Other"];
            return _.filter(
                _.map(
                    categories, function (category) {
                        var r = _.filter(
                            releves, function (releve) {
                                return releve.category == category && releve.debit;
                            });
                        var v = _.map(r, function (releve) {
                            return releve.amount
                        });
                        var value = _.reduce(v, function (a, b) {
                            return a + b;
                        }, 0);
                        return {category: category, value: value}
                    }), function (o) {
                    return o.value > 0.1;
                });
        }

        function gagne(releves) {
            var credits = _.filter(releves, function(releve) { return ! releve.debit});
            var c = _.map(credits, function(r) { return r.amount });
            return _.reduce(c, function(a, b){ return a + b; }, 0);
        }

        function perdu(releves) {
            var debits = _.filter(releves, function(releve) { return releve.debit});
            var d = _.map(debits, function(r) { return r.amount });
            return _.reduce(d, function(a, b){ return a + b; }, 0);
        }

        function refreshPie(releves) {
            $rootScope.$broadcast('refreshPieData', createPie(releves));
        }

        function refreshHistory(releves) {
            $rootScope.$broadcast('refreshHistoryData', createHistory(releves));
        }

        return {
            createHistory: createHistory,
            createPie: createPie,
            gagne: gagne,
            perdu: perdu,
            refreshPie: refreshPie
        }
    }])
    .controller('ReleveListController', ['$scope', '$http', 'StatsService', function ($scope, $http, StatsService) {

        $scope.releves = serverData.releves;
        $scope.historyReleves = serverData.releves;
        $scope.pieReleves = serverData.releves;
        $scope.form = {
            date: undefined,
            description: undefined,
            amount: undefined,
            debit: undefined,
            category: undefined
        };

        $scope.checkDebit = function(releve) {
            return releve.debit
        };

        $scope.isActive = function(releve) {return typeof releve.isActive === "undefined" || releve.isActive};

        $scope.togglePieReleve = function(releve) {
            if($scope.isActive(releve)){
                releve.isActive = false;
                $scope.pieReleves = _.filter($scope.pieReleves, function(r){return r != releve})
            } else {
                releve.isActive = true;
                $scope.pieReleves.push(releve);
            }
            StatsService.refreshPie($scope.pieReleves)
        };

        $('#submitter').click(function() {
            console.log($scope.form.date);
            var data = {
                date:  $scope.form.date,
                description: $scope.form.description,
                amount: $scope.form.amount,
                debit: $scope.form.debit,
                category: $scope.form.category
            };
            $http.post("/addReleve", data)
                .success(function() {
                    $scope.releves.push(data);
                    $scope.pieReleves.push(data);
                    StatsService.refreshPie($scope.pieReleves);
                    $scope.historyReleves.push(data);
                    StatsService.refreshHistory($scope.historyReleves)
                })
        });

        $('#debit').click(function () {
            var span = $('#debitSpan');
            if (span.text() === 'Debit') {
                span.text('Credit')
            } else {
                span.text('Debit')
            }
        });
    }])
    .controller('StatsController', ['$scope', '$http', 'StatsService', function ($scope, $http, StatsService) {

        $scope.lineData = StatsService.createHistory(serverData.releves);
        $scope.pieData = StatsService.createPie(serverData.releves);
        $scope.gagne = StatsService.gagne(serverData.releves);
        $scope.perdu = StatsService.perdu(serverData.releves);

        //Draw history
        {
            var vis = d3.select('.courbe'),
                WIDTH = 500,
                HEIGHT = 300,
                MARGINS = {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 50
                },
                xRange = d3.scale.linear()
                    .range([MARGINS.left, WIDTH - MARGINS.right])
                    .domain(d3.extent($scope.lineData, function (d) { return d.x; })),
                yRange = d3.scale.linear()
                    .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                    .domain(d3.extent($scope.lineData, function (d) { return d.y; })),
                xAxis = d3.svg.axis()
                    .scale(xRange)
                    .tickSize(1)
                    .tickSubdivide(true),
                yAxis = d3.svg.axis()
                    .scale(yRange)
                    .tickSize(1)
                    .orient('left')
                    .tickSubdivide(true);

            vis.append('svg:g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
                .call(xAxis);

            vis.append('svg:g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
                .call(yAxis);

            var lineFunc = d3.svg.line()
                .x(function(d) { return xRange(d.x); })
                .y(function(d) { return yRange(d.y); })
                .interpolate('basis');

            refreshHistoryData()
        }

        $scope.$on('refreshHistoryData', function(event, data){
            $scope.lineData = data;
            refreshHistoryData();
        });
        function refreshHistoryData() {
            vis.append('svg:path')
                .attr('d', lineFunc($scope.lineData));
        }

        //Draw pie
        {
            var width = 300,
                height = 300,
                radius = Math.min(width, height) / 2;

            var color = d3.scale.ordinal()
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

            var arc = d3.svg.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function (d) {
                    return d.value;
                });

            refreshPieData();

        }
        $scope.$on('refreshPieData', function(event, data){
            $scope.pieData = data;
            refreshPieData()
        });
        function refreshPieData() {
            var svg = d3.select(".pie")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            $scope.pieData.forEach(function (d) {
                d.value = +d.value;
            });

            var g = svg.selectAll(".pie")
                .data(pie($scope.pieData))
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d) {
                    return color(d.data.category);
                });

            g.append("text")
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.category;
                });
        }


    }])
    .directive('releveCard', function() {
        return {
            restrict: 'E',
            scope: {
                releve: '='
            },
            templateUrl: '/assets/javascripts/relevesList/releveCard.html',
            replace: true
        };
    });