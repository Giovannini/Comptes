'use strict';


angular.module('CompteApp', [])
    .factory('DataService', ['$http', function ($http) {
        function getReleves() {
            return $http.get("/api/releves").then(function (result) {
                return result.data.releves;
            })
        }

        function getHistory() {
            return $http.get("/api/stats/history").then(function (result) {
                return result.data.history;
            })
        }

        function getMonthlyAverage() {
            return $http.get("/api/stats/monthly-average").then(function (result) {
                return result.data.monthlyAverage;
            })
        }

        function getWeeklyReport() {
            return $http.get("/api/stats/weekly-report").then(function (result) {
                return result.data;
            })
        }

        return {
            getReleves: getReleves,
            getMonthlyAverage: getMonthlyAverage,
            getHistory: getHistory,
            getWeeklyReport: getWeeklyReport
        }

    }])
    .factory('StatsService', ['$rootScope', function ($rootScope) {

        function createHistoryDataset(data) {
            var lineData = [];
            for (var i = 0; i < data.length; ++i) {
                var d = data[i];
                lineData.push({x: i, y: d.montant});
            }
            return lineData;
        }

        //Create dataset for pie
        function createPie(releves) {
            var categories = ["Home", "Bills", "Food", "Shopping", "Transport", "Other"];
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

        //Compute earned money
        function gagne(releves) {
            var credits = _.filter(releves, function (releve) {
                return !releve.debit
            });
            var c = _.map(credits, function (r) {
                return r.amount
            });
            return _.reduce(c, function (a, b) {
                return a + b;
            }, 0);
        }

        //compute lost money
        function perdu(releves) {
            var debits = _.filter(releves, function (releve) {
                return releve.debit
            });
            var d = _.map(debits, function (r) {
                return r.amount
            });
            return _.reduce(d, function (a, b) {
                return a + b;
            }, 0);
        }

        function refreshPie(releves) {
            $rootScope.$broadcast('refreshPieData', createPie(releves));
        }

        function refreshHistoryDataset(data) {
            $rootScope.$broadcast('refreshHistoryData', createHistoryDataset(data));
        }

        return {
            createHistoryDataset: createHistoryDataset,
            createPie: createPie,
            gagne: gagne,
            perdu: perdu,
            refreshPie: refreshPie,
            refreshHistoryDataset: refreshHistoryDataset
        }
    }])
    .controller('ReleveListController', ['$scope', '$http', 'StatsService', 'DataService',
        function ($scope, $http, StatsService, DataService) {

            DataService.getReleves().then(function (releves) {
                var rs = releves.slice();
                $scope.releves = rs;
                $scope.pieReleves = rs;
                $scope.form = {
                    date: undefined,
                    description: undefined,
                    amount: undefined,
                    debit: false,
                    category: "Other"
                };
            });

            DataService.getHistory().then(function (data) {
                //TODO: partition?
                $scope.historyReleves = data;
                //console.log(data);
            });

            $scope.isActive = function (releve) {
                return typeof releve.isActive === "undefined" || releve.isActive
            };

            $scope.togglePieReleve = function (releve) {
                console.log(releve.date.substr(0, 10).split("-")[2]);
                var caca = releve.date.substr(0, 10).split("-")[2];
                if ($scope.isActive(releve)) {
                    releve.isActive = false;
                    $scope.pieReleves = _.filter($scope.pieReleves, function (r) {
                        return r != releve
                    });
                    console.log($scope.historyReleves);
                    _.map($scope.historyReleves, function (r) {
                        if (r.date == caca) r.montant -= releve.amount;
                    });
                } else {
                    releve.isActive = true;
                    $scope.pieReleves.push(releve);
                    _.map($scope.historyReleves, function (r) {
                        if (r.date == caca) r.montant += releve.montant;
                    });
                }
                StatsService.refreshPie($scope.pieReleves);
                StatsService.refreshHistoryDataset($scope.historyReleves);
            };

            $scope.submitForm = function () {
                var data = {
                    date: $scope.form.date,
                    description: $scope.form.description,
                    amount: $scope.form.amount,
                    debit: $scope.form.debit,
                    category: $scope.form.category
                };
                $http.put("/api/addReleve", data)
                    .success(function () {
                        $scope.releves.unshift(data);
                        $scope.pieReleves.push(data);
                        $scope.historyReleves.push(data);
                        StatsService.refreshPie($scope.pieReleves);
                        StatsService.refreshHistoryDataset($scope.historyReleves);
                    })
            };
        }])
    .controller('StatsController', ['$scope', '$http', 'StatsService', 'DataService',
        function ($scope, $http, StatsService, DataService) {

            DataService.getReleves().then(function (releves) {
                $scope.pieData = StatsService.createPie(releves);
                $scope.gagne = StatsService.gagne(releves);
                $scope.perdu = StatsService.perdu(releves);

                refreshPieSVG($scope.pieData);
            });

            DataService.getMonthlyAverage().then(function(data) {
                $scope.monthlyAverage = data;
            });

            DataService.getHistory().then(function (data) {
                $scope.lineData = StatsService.createHistoryDataset(data);
                refreshHistorySVG($scope.lineData);
            });

            function refreshHistorySVG(data) {
                d3.select(".courbe").selectAll("g").remove();
                d3.select(".courbe").selectAll("path").remove();

                var vis = d3.select('.courbe'),
                    WIDTH = 500,
                    HEIGHT = 300,
                    MARGINS = {top: 20, right: 20, bottom: 20, left: 50},
                    xRange = d3.scale.linear()
                        .range([MARGINS.left, WIDTH - MARGINS.right])
                        .domain(d3.extent(data, function (d) {
                            return d.x;
                        })),
                    yRange = d3.scale.linear()
                        .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                        .domain([
                            d3.min(data, function (d) {
                                return d.y > 0 ? 0 : d.y;
                            }),
                            d3.max(data, function (d) {
                                return d.y;
                            })
                        ]),
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
                    .x(function (d) {
                        return xRange(d.x);
                    })
                    .y(function (d) {
                        return yRange(d.y);
                    })
                    .interpolate('basis');

                vis.append('svg:path')
                    .attr('d', lineFunc(data));
            }

            function refreshPieSVG(data) {
                d3.select(".pie").select("*").remove();

                var width = 300,
                    height = 300,
                    radius = Math.min(width, height) / 3,
                    labelr = radius;

                var color = d3.scale.ordinal()
                    .range(["#073359", "#27708C", "#D9D2C5", "#BFB6AA", "#595248", "#d0743c"]);

                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function (d) {
                        return d.value;
                    });

                var svg = d3.select(".pie")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                data.forEach(function (d) {
                    d.value = +d.value;
                });

                var text;
                var g = svg.selectAll(".pie")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");

                g.append("path")
                    .attr("d", arc)
                    .style("fill", function (d) {
                        return color(d.data.category);
                    });

                g.append("svg:text")
                    .attr("transform", function (d) {
                        var c = arc.centroid(d),
                            x = c[0],
                            y = c[1],
                        // pythagorean theorem for hypotenuse
                            h = Math.sqrt(x * x + y * y);
                        return "translate(" + (x / h * labelr) + ',' + (y / h * labelr) + ")";
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function (d) {
                        // are we past the center?
                        return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
                    })
                    .text(function (d) {
                        return d.data.category;
                    });

            }

            //TODO créer watcher sur modèles lineData at PieData, leur update mettra à jour le modèle automatiquement ainsi
            $scope.$on('refreshHistoryData', function (event, data) {
                $scope.lineData = data;
                refreshHistorySVG($scope.lineData);
            });

            $scope.$on('refreshPieData', function (event, data) {
                $scope.pieData = data;
                refreshPieSVG($scope.pieData)
            });

        }])
    .directive('releveCard', function () {
        return {
            restrict: 'E',
            scope: {
                releve: '='
            },
            templateUrl: '/assets/javascripts/relevesList/releveCard.html',
            replace: true
        };
    });