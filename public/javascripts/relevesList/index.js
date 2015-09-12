'use strict';


angular.module('CompteApp', [])
    .controller('ReleveListController', ['$scope', '$http', function ($scope, $http) {

        //get('/releves');

        $scope.releves = [
            {
                date: "17/5/2015",
                description: "Repas du midi au Cojean",
                amount: 8.40,
                debit: false,
                category: "Other"
            },
            {
                date: "17/5/2015",
                description: "Cojean",
                amount: 8.40,
                debit: true,
                category: "Other"
            },
            {
                date: "17/5/2015",
                description: "Repas du midi au Cojean",
                amount: 8.40,
                debit: false,
                category: "Other"
            },
            {
                date: "17/5/2015",
                description: "Cojean",
                amount: 8.40,
                debit: true,
                category: "Other"
            },
            {
                date: "17/5/2015",
                description: "Repas du midi au Cojean",
                amount: 8.40,
                debit: true,
                category: "Other"
            },
            {
                date: "17/5/2015",
                description: "Cojean",
                amount: 8.40,
                debit: true,
                category: "Other"
            }
        ];

        //$scope.unflip = function(event) {
        //    event.target.parentElement.classList.remove( 'is-open' );
        //};
        //
        //$scope.flip = function(event) {
        //    var element = event.target.parentElement;
        //    var mx = event.clientX - element.offsetLeft,
        //        my = event.clientY - element.offsetTop;
        //    var width = element.offsetWidth,
        //        height = element.offsetHeight;
        //
        //    var directions = [
        //        { id: 'top', x: width/2, y: 0 },
        //        { id: 'right', x: width, y: height/2 },
        //        { id: 'bottom', x: width/2, y: height },
        //        { id: 'left', x: 0, y: height/2 }
        //    ];
        //
        //    directions.sort( function( a, b ) {
        //        return distance( mx, my, a.x, a.y ) - distance( mx, my, b.x, b.y );
        //    } );
        //
        //    element.setAttribute( 'data-direction', directions.shift().id );
        //    var allCards = $(".releve-card");
        //    allCards.each(function(index) {
        //        allCards[index].classList.remove( 'is-open' );
        //    });
        //    element.classList.add( 'is-open' );
        //};

        //function distance( x1, y1, x2, y2 ) {
        //    var dx = x1-x2;
        //    var dy = y1-y2;
        //    return Math.sqrt( dx*dx + dy*dy );
        //}

        //$scope.displayForm = function() {
        //    console.log("caca");
        //    $('#addReleveForm').style.display='block';
        //    $('#fade').style.display='block';
        //};
        //
        //$scope.hideForm = function() {
        //    $('#addReleveForm').style.display='none';
        //    $('#fade').style.display='none';
        //};

        $scope.checkDebit = function(releve) {
            console.log(releve);
            return releve.debit
        };

        function get(url) {
            $http.get(url)
                .success(function (result) {
                    $scope.releves = result.releves;
                }).error(function (e) {
                    console.log(e);
                });
        }

        $('#submitter').click(function() {
            var data = {
                date: $('#date').val(),
                description: $('#description').val(),
                amount: parseFloat($('#amount').val()),
                debit: $('#debit').prop('checked'),
                category: $('#category').val()
            };
            $http.post("/addReleve", data)
                .success(function() {
                    $scope.releves.push(data);
                    //hideForm()
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