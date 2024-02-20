// ==UserScript==
// @name         Tsubaki's GroundCloud
// @namespace    https://github.com/trevorftp
// @version      0.0.1
// @description  Redesign GroundCloud.io
// @author       Trevor Derifield
// @match        https://groundcloud.io/*
// @grant        GM_addStyle
// ==/UserScript==

    /* Copyright (C) 2024 Trevor Derifield

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
    */

(function() {
    'use strict';

    console.log('Tsubakis GroundCloud Script has ran!');

    function notification(message, textColor, iconColor, bgColor, borderColor) {
        // Create a new div element for the notification
        var notificationDiv = document.createElement('div');
        notificationDiv.className = 'route-list__stops_flagged alert alert-danger';
        notificationDiv.setAttribute('data-v-33da10de', ''); // Set data-v attribute

        // Apply custom styles
        notificationDiv.style.color = textColor;
        notificationDiv.style.backgroundColor = bgColor;
        notificationDiv.style.borderColor = borderColor;

        // Create a close button (X)
        var closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.setAttribute('data-v-33da10de', ''); // Set data-v attribute
        closeButton.innerHTML = '&times;'; // Use HTML entity for X
        closeButton.addEventListener('click', function() {
            // Remove the notification when the close button is clicked
            notificationDiv.remove();
        });
        notificationDiv.appendChild(closeButton);

        // Create a span element for the icon
        var iconSpan = document.createElement('span');
        iconSpan.className = 'icon icon-new';
        iconSpan.setAttribute('data-v-33da10de', ''); // Set data-v attribute
        iconSpan.style.color = iconColor;
        notificationDiv.appendChild(iconSpan);

        // Create a span element for the message
        var messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageSpan.style.paddingLeft = '5px'; // Add padding to the left
        notificationDiv.appendChild(messageSpan);

        // Get the route-list row mt-3 element to append the new notification
        var routeListRow = document.querySelector('.route-list.row.mt-3');
        if (routeListRow) {
            // Find the card-body element under the route-list row
            var cardBody = routeListRow.querySelector('.card-body');
            if (cardBody) {
                // Insert the new notification before the first child of card-body (at the top)
                cardBody.insertBefore(notificationDiv, cardBody.firstChild);
            } else {
                console.error('Card-body element not found under route-list row!');
            }
        } else {
            console.error('Route-list row element not found!');
        }
    }

    // Function to add the 'Est. To Completion' column to the table
    function addEstToCompletionColumn() {
        // Select the header row element
        var headerRow = document.querySelector('.route-list-header__row');

        // Check if the header row exists
        if (headerRow) {
            // Add custom header.
            var estCompHead = 'Est. To Completion';
            var estCompTh = document.createElement('th');
            estCompTh.textContent = estCompHead;
            estCompTh.setAttribute('data-v-33da10de', ''); // Set data-v attribute
            headerRow.appendChild(estCompTh);

            // Select the specific th element for the "Name" header
            var nameHeader = headerRow.querySelector('th[data-v-33da10de=""]');

            // Check if the name header exists
            if (nameHeader) {
                // Change the text content to "Work Area"
                nameHeader.textContent = 'Work Area';
            }

            // Find all table rows
            var tableRows = document.querySelectorAll('.route-list-row__row');

            // Iterate through each table row
            tableRows.forEach(function(row) {
                // Get the value from the "route-list-row__stop-per-hour align-middle" td
                // route-list-row__packages align-middle
                var stopPerHourTd = row.querySelector('.route-list-row__stop-per-hour.align-middle');
                var stopPerHourValue = stopPerHourTd.textContent.trim();

                // Get the value from the "route-list-row__stops align-middle" td
                var stopsTd = row.querySelector('.route-list-row__stops.align-middle');
                var packagesTd = row.querySelector('.route-list-row__packages.align-middle');
                var stopsValue = stopsTd.querySelector('.col-xl-6.text-xl-right');
                var stopsText = stopsValue ? stopsValue.textContent.trim() : 'N/A';

                var stopProgress = stopsTd.querySelector('.progress');
                var packageProgress = packagesTd.querySelector('.progress');
                stopProgress.style.height = '30px';
                packageProgress.style.height = '30px';

                var stopContainer = stopsTd.querySelector('.gc-overview-progress-bar.progress-bar-width');
                var packageContainer = packagesTd.querySelector('.gc-overview-progress-bar.progress-bar-width');
                var stopTextRow = stopsTd.querySelector('.row.text-nowrap');
                var packageTextRow = packagesTd.querySelector('.row.text-nowrap');

                if (stopContainer && packageContainer && stopTextRow && packageTextRow) {
                    // Append the text row to the container
                    stopContainer.appendChild(stopTextRow);
                    packageContainer.appendChild(packageTextRow);

                    // Adjust the positioning of the text row
                    stopTextRow.style.position = 'relative';
                    stopTextRow.style.top = '-25px'; // Adjust this value as needed
                    stopTextRow.style.left = '5%'; // Adjust this value as needed
                    stopTextRow.style.textAlign = 'center';
                    stopTextRow.style.width = '100%';

                    packageTextRow.style.position = 'relative';
                    packageTextRow.style.top = '-25px'; // Adjust this value as needed
                    packageTextRow.style.left = '5%'; // Adjust this value as needed
                    packageTextRow.style.textAlign = 'center';
                    packageTextRow.style.width = '100%';
                }

                // If stopsValue is 'N/A', set stopsText to 'N/A'
                if (stopsText === 'N/A') {
                    stopsValue = stopsText;
                }
                else if (stopsValue.querySelector('svg[data-icon="check"]')) {
                    stopsValue = "N/A";
                } else {
                    stopsValue = stopsText.replace(/[^\d.-]/g, '');
                }

                // Create a new td element
                var newTd = document.createElement('td');
                newTd.setAttribute('data-v-33da10de', ''); // Set data-v attribute
                newTd.className = 'route-list-row__est-comp align-middle'; // Set class name

                // Perform division only if stopPerHourValue is not 'N/A' and stopsValue is not 'N/A'
                if (stopPerHourValue !== 'N/A' && stopPerHourValue != 0 && stopsValue !== 'N/A') {
                    // Parse values to floats and perform division
                    var stopPerHour = parseFloat(stopPerHourValue);
                    var stops = parseFloat(stopsValue);
                    var result = stops / stopPerHour;

                    // Convert result to time format
                    var hours = Math.floor(result);
                    var minutes = Math.round((result - hours) * 60);
                    var timeString = hours + 'h ' + minutes + 'm Left';
                    // Set content to the formatted time string
                    newTd.textContent = timeString;

                    // Update the color of the progress bar based on remaining time
                    var stopProgressBar = stopsTd.querySelector('.progress-bar');
                    var packageProgressBar = packagesTd.querySelector('.progress-bar');
                    if (hours >= 10) {
                        stopProgressBar.style.backgroundColor = '#f18383'; // Red color
                        packageProgressBar.style.backgroundColor = '#f18383'; // Red color
                    } else if (hours >= 8) {
                        stopProgressBar.style.backgroundColor = '#f7b461'; // Yellow color
                        packageProgressBar.style.backgroundColor = '#f7b461'; // Yellow color
                    } else {
                        stopProgressBar.style.backgroundColor = '#39e961'; // Green color
                        packageProgressBar.style.backgroundColor = '#39e961'; // Green color
                    }
                } else {
                    // If stopPerHourValue or stopsValue is 'N/A', set content to 'N/A'
                    newTd.textContent = 'N/A';
                }

                // Append new td to current row
                row.appendChild(newTd);
            });
        }
    }

    // Function to update Est. To Completion values
    function updateEstToCompletionValues() {
        // Get all existing Est. To Completion cells
        var estCompCells = document.querySelectorAll('.route-list-row__est-comp');

        // Iterate through each Est. To Completion cell
        estCompCells.forEach(function(cell) {
            // Get the corresponding stop per hour and stops values
            var stopPerHourTd = cell.closest('.route-list-row__row').querySelector('.route-list-row__stop-per-hour.align-middle');
            var stopPerHourValue = stopPerHourTd.textContent.trim();

            var stopsTd = cell.closest('.route-list-row__row').querySelector('.route-list-row__stops.align-middle');
            var stopsValue = stopsTd.querySelector('.col-xl-6.text-xl-right');
            var stopsText = stopsValue ? stopsValue.textContent.trim() : 'N/A';
            // If stopsValue is 'N/A', set stopsText to 'N/A'
            if (stopsText === 'N/A') {
                stopsValue = stopsText;
            } else {
                stopsValue = stopsText.replace(/[^\d.-]/g, '');
            }

            // Perform division only if stopPerHourValue is not 'N/A' and stopsValue is not 'N/A'
            if (stopPerHourValue !== 'N/A' && stopsValue !== 'N/A') {
                // Parse values to floats and perform division
                var stopPerHour = parseFloat(stopPerHourValue);
                var stops = parseFloat(stopsValue);
                var result = stops / stopPerHour;

                // Convert result to time format
                var hours = Math.floor(result);
                var minutes = Math.round((result - hours) * 60);
                var timeString = hours + 'h ' + minutes + 'm Left';
                // Set content to the formatted time string
                cell.textContent = timeString;

                // Update the color of the progress bar based on remaining time
                var progressBar = stopsTd.querySelector('.progress-bar');
                if (hours >= 10) {
                    progressBar.style.backgroundColor = '#a72828'; // Red color
                } else if (hours >= 8) {
                    progressBar.style.backgroundColor = '#f5a644'; // Yellow color
                } else {
                    progressBar.style.backgroundColor = '#28a745'; // Green color
                }
            } else {
                // If stopPerHourValue or stopsValue is 'N/A', set content to 'N/A'
                cell.textContent = 'N/A';
            }
        });
    }

    // Wait for the DOM content to load
    document.addEventListener('DOMContentLoaded', function() {
        // Add a short delay to ensure elements are fully loaded
        setTimeout(function() {
            // Call the function to add Est. To Completion column
            addEstToCompletionColumn();
            notification("Tsubaki's GroundCloud - Version 0.0.1 - Report any issues to Trevor.", "#000000", "#73c714", "#ace36d", "#89b853");
            // Use MutationObserver to watch for changes in the table body
            var observer = new MutationObserver(function(mutationsList) {
                for (var mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // Call the function to update Est. To Completion values whenever the table body is updated
                        updateEstToCompletionValues();
                    }
                }
            });

            // Select the table body to observe
            var tableBody = document.querySelector('.route-table tbody');

            // Configure and start the observer
            if (tableBody) {
                observer.observe(tableBody, { attributes: false, childList: true, subtree: false });
            }
        }, 800); // Adjust the delay as needed
    });



    // Navbar test, half works.
    /*GM_addStyle(`
        @media (min-width: 0px) {
            .nav-toggler-md {
                display: block !important;
            }
        }
        @media (min-width: 0px) { #wrapper.toggled #sidebar-wrapper { width: 0px; } }
        @media (min-width: 0px) { #wrapper.toggled #page-content-wrapper { position: relative; margin-right: 0; }
        @media (min-width: 0px) { #wrapper, #wrapper.toggled { padding-left: 0px; }
    `);*/
})();
