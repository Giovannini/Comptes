'use strict';


angular.module('CompteApp', [])
    .controller('ReleveListController', ['$scope', '$http', function ($scope, $http) {

        get('/releves');

        $scope.displayForm = function() {
            console.log("caca");
            $('#addReleveForm').style.display='block';
            $('#fade').style.display='block';
        };

        $scope.hideForm = function() {
            $('#addReleveForm').style.display='none';
            $('#fade').style.display='none';
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
            console.log("caca");
            var data = {
                date: $('#date').val(),
                description: $('#description').val(),
                amount: parseFloat($('#amount').val()),
                debit: $('#debit').prop('checked')
            };
            console.log(data);
            $http.post("/addReleve", data)
                .success(function() {
                    $scope.releves.push(data);
                    hideForm()
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