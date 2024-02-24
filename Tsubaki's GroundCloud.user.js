// ==UserScript==
// @name         Tsubaki's GroundCloud
// @namespace    https://github.com/trevorftp
// @version      0.0.3
// @description  Redesign GroundCloud.io
// @author       Trevor Derifield
// @match        https://groundcloud.io/*
// @downloadURL https://github.com/trevorftp/Tsubakis-GroundCloud/blob/main/Tsubaki's%20GroundCloud.user.js
// @updateURL	https://github.com/trevorftp/Tsubakis-GroundCloud/blob/main/Tsubaki's%20GroundCloud.user.js
// @require     https://aethiingekaif4ua.storage.googleapis.com/frontend/js/dashboard/overview.js
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

    var appRoot;
    var vueInstance;
    var authWrapper;
    var overview;
    var overviewMap;
    var routeList;

    function checkPage(page) {
        return (window.location.href.includes(page));
    }

    function setupVue() {
        // Vue Stuff..
        /*
            -------------------------------------    <RouteList> Stuff    -------------------------------------
            Each Table Data item gets <OverviewProgressBar>, <OverviewProgressBar>, <RouteDayExceptionDetails>, <BLink>.
            <OverviewProgressBar> - Route Stops
                  progressBarBackgroundColor - Fill Color (DEF. #28a745)
                  valueMax - Route Total Stops
                  valueMin - Minimum Bar Value (Always 0)
                  valueNow - Route Stops Done
                  --- Computed Data ---
                  complete - Bool (Assuming it turns true when valueNow == ValueMax)
                  leftDisplay - String (How many stops left)

            <OverviewProgressBar> - Route Packages
                  progressBarBackgroundColor - Fill Color (DEF. #28a745)
                  valueMax - Route Total Packages
                  valueMin - Minimum Bar Value (Always 0)
                  valueNow - Route Packages Done
                  --- Computed Data ---
                  complete - Bool (Assuming it turns true when valueNow == ValueMax)
                  leftDisplay - String (How many stops left)

            <RouteDayExceptionDetails> - Status Codes (Also Contains route, routeDay and driver information)
                  exceptionsCompleted - A status code or attempted delivery.
                  impactsCompleted - A impactable status code. (02, 03, 04, 06, etc...)
                  routeDay - Information about the route, routeDay, and driver.
                        est_distance - Estimated route distance. (Not sure this is used on the dashboard).
                        est_travel_time - Estimated drive time in seconds.
                        miles_total - Estimated total miles.
                        driver - Driver information.
                              user - Any good information is under user.
                                    email - Drivers email.
                                    first_name - Drivers first name.
                                    last_name - Drivers last name.
                                    username - Drivers username.
                        route - Route information (Only good for WA#)
                              name - Route work area.
            -----------------------------------------------------------------------------------------------------
            -------------------------------------    <OverViewMap> Stuff    -------------------------------------
            driversWithLastLocation - Array[NUM] (May be useful for logouts?)
        */
        appRoot = document.querySelector('#overview_viewapp');

        if (appRoot) {
            // Access the Vue instance
            vueInstance = appRoot.__vue__;
            console.log('Vue detected and found: ', vueInstance);

            // Traverse the Vue instance hierarchy to reach our components.
            authWrapper = vueInstance.$children.find(child => child.$options.name === 'AuthWrapper');
            overview = authWrapper.$children.find(child => child.$options.name === 'Overview');
            overviewMap = overview.$children.find(child => child.$options.name === 'OverviewMap');
            routeList = overview.$children.find(child => child.$options.name === 'RouteList');
        } else {
            console.log('The Vue instance could not be found.');
        }
    }

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

    function refreshTableData() {
        // Find all table rows
        var tableRows = document.querySelectorAll('.route-list-row__row');

        // Iterate through each table row
        tableRows.forEach(function(row, index) {
            // Check if the custom row already exists
            var estCompRow = row.querySelector('.route-list-row__est-comp');

            // If the custom row doesn't exist, add it back
            if (!estCompRow) {
                addEstToCompletionColumn();
            }
        });
    }

    // Function to add the 'Est. To Completion' column to the table
    function addEstToCompletionColumn() {
        // Select the header row element
        var headerRow = document.querySelector('.route-list-header__row');

        // Check if the header row exists
        if (headerRow) {
            // Select the specific th element for the "Name" header
            var nameHeader = headerRow.querySelector('th[data-v-33da10de=""]');

            // Check if the name header exists
            if (nameHeader) {
                // Change the text content to "Work Area"
                nameHeader.textContent = 'Work Area';
            }

            // Check if the custom header already exists
            if (!headerRow.querySelector('th[data-v-33da10de=""][data-sortby="Completion"]')) {
                // Add custom header.
                var estCompHead = 'Est. To Completion';
                var estCompTh = document.createElement('th');
                estCompTh.textContent = estCompHead;
                estCompTh.setAttribute('data-v-33da10de', ''); // Set data-v attribute
                estCompTh.setAttribute('data-sortby', 'Completion'); // Set data-sortby attribute to match sorting functionality
                headerRow.appendChild(estCompTh);
            }

            // Find all table rows
            var tableRows = document.querySelectorAll('.route-list-row__row');

            // Iterate through each table row
            routeList.filteredRouteDays.forEach(function(routeDay, index) {
                // Get the corresponding table row
                var row = tableRows[index];

                if (row && routeDay) {
                    // Access the stopsPerHourStatsByRouteDay object for the current routeDay
                    var routeId = routeDay.id;
                    var stopsPerHourStats = routeList.stopsPerHourStatsByRouteDay[routeId];
                    var stopStats = routeList.stopStatsByRouteDay[routeId];

                    // Get the value from the "route-list-row__stops align-middle" td
                    var stopsTd = row.querySelector('.route-list-row__stops.align-middle');
                    var packagesTd = row.querySelector('.route-list-row__packages.align-middle');
                    var stopsValue = stopStats.total - stopStats.completed;
                    var stopsText = stopsValue;

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

                    // Check if the custom row already exists
                    var estCompRow = row.querySelector('.route-list-row__est-comp');

                    // If the custom row doesn't exist, add it back
                    if (!estCompRow) {
                        // Create a new td element
                        var newTd = document.createElement('td');
                        newTd.setAttribute('data-v-33da10de', ''); // Set data-v attribute
                        newTd.className = 'route-list-row__est-comp align-middle'; // Set class name

                        // Perform division only if stopPerHourValue is not 'N/A' and stopsValue is not 'N/A'
                        if (stopsPerHourStats && stopsPerHourStats.completed != 0) {
                            // Parse values to floats and perform division
                            var stopPerHour = parseFloat(stopsPerHourStats.completed);
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
                    }
                }
            });
        }
    }

    function addStyles() {
        var customStyles = `
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .login-container {
            max-width: 400px;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .logo {
            margin-bottom: 20px;
        }
        .panel-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .form-control {
            width: 100%;
            height: 40px;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
            font-size: 16px;
        }
        .btn-primary {
            width: 100%;
            height: 40px;
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
        }
        .btn-forgot {
            margin-top: 10px;
            font-size: 14px;
            color: #007bff;
            text-decoration: none;
        }
        .error-message {
            color: #a94442;
            margin-top: 10px;
        }
    `;
        var styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
    }

    // Function to customize the login page
    function customizeLoginPage() {
        // Add custom styles
        addStyles();

        // Get CSRF token value
        var csrfTokenInputOriginal = document.querySelector('input[name="csrfmiddlewaretoken"]');
        var csrfTokenValue = csrfTokenInputOriginal ? csrfTokenInputOriginal.value : '';

        /// Create a new styled login form
        var container = document.createElement('div');
        container.className = 'login-container';

        var logo = document.createElement('div');
        logo.className = 'logo';
        logo.innerHTML = '<img src="https://aethiingekaif4ua.storage.googleapis.com/dashboard/icons/logo.ff12464aa744.png" alt="GroundCloud Logo">';

        var panelTitle = document.createElement('div');
        panelTitle.className = 'panel-title';
        panelTitle.textContent = 'Welcome Back';

        var form = document.createElement('form');
        form.action = '/dashboard/login/?next=';
        form.method = 'post';

        var csrfTokenInput = document.createElement('input');
        csrfTokenInput.type = 'hidden';
        csrfTokenInput.name = 'csrfmiddlewaretoken';
        csrfTokenInput.value = csrfTokenValue; // Set the CSRF token value

        var usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.name = 'username';
        usernameInput.autofocus = true;
        usernameInput.autocomplete = 'username';
        usernameInput.placeholder = 'Username';
        usernameInput.className = 'form-control';

        var passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.name = 'password';
        passwordInput.autocomplete = 'current-password';
        passwordInput.placeholder = 'Password';
        passwordInput.className = 'form-control';

        var loginButton = document.createElement('button');
        loginButton.type = 'submit';
        loginButton.textContent = 'Login';
        loginButton.className = 'btn btn-primary';

        // Forgot password link
        var forgotPasswordLink = document.createElement('a');
        forgotPasswordLink.href = 'https://groundcloud.io/dashboard/users/password_reset';
        forgotPasswordLink.textContent = 'Forgot Password?';
        forgotPasswordLink.className = 'btn-forgot';

        form.append(csrfTokenInput, usernameInput, passwordInput, loginButton);
        container.append(logo, panelTitle, form, forgotPasswordLink);

        // Function to check if the page contains the incorrect password error message
        function isIncorrectPassword() {
            return document.querySelector('.alert.alert-danger ul.errorlist.nonfield li') !== null;
        }

        // Display error message if the password is incorrect
        if (isIncorrectPassword()) {
            var errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.textContent = 'Incorrect username or password. Please try again.';
            container.appendChild(errorContainer);
        }

        // Replace the existing login container with the new styled one
        var existingContainer = document.querySelector('.p-t-lg.col-md-6.col-md-offset-3.col-sm-8.col-sm-offset-2');
        existingContainer.parentNode.replaceChild(container, existingContainer);

        // Add background image to the login page
        document.body.style.backgroundImage = 'url("https://papers.co/wallpaper/papers.co-vt06-abstract-art-color-basic-background-pattern-23-wallpaper.jpg")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
    }

    function customizeForgotPasswordPage() {
        // Add custom styles
        addStyles();

        // Get CSRF token value
        var csrfTokenInputOriginal = document.querySelector('input[name="csrfmiddlewaretoken"]');
        var csrfTokenValue = csrfTokenInputOriginal ? csrfTokenInputOriginal.value : '';

        // Create a new styled forgot password form
        var container = document.createElement('div');
        container.className = 'login-container';

        var logo = document.createElement('div');
        logo.className = 'logo';
        logo.innerHTML = '<img src="https://aethiingekaif4ua.storage.googleapis.com/dashboard/icons/logo.ff12464aa744.png" alt="GroundCloud Logo">';

        var panelTitle = document.createElement('div');
        panelTitle.className = 'panel-title';
        panelTitle.textContent = 'Reset Your Password';

        var form = document.createElement('form');
        form.action = '/dashboard/users/password_reset';
        form.method = 'post';

        var csrfTokenInput = document.createElement('input');
        csrfTokenInput.type = 'hidden';
        csrfTokenInput.name = 'csrfmiddlewaretoken';
        csrfTokenInput.value = csrfTokenValue; // Set the CSRF token value

        var emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.autofocus = true;
        emailInput.autocomplete = 'email';
        emailInput.placeholder = 'Email';
        emailInput.className = 'form-control';

        var submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit';
        submitButton.className = 'btn btn-primary';

        form.append(csrfTokenInput, emailInput, submitButton);
        container.append(logo, panelTitle, form);

        // Replace the existing login container with the new styled one
        var existingContainer = document.querySelector('.p-t-lg.col-md-6.col-md-offset-3.col-sm-8.col-sm-offset-2');
        existingContainer.parentNode.replaceChild(container, existingContainer);

        // Add background image to the forgot password page
        document.body.style.backgroundImage = 'url("https://papers.co/wallpaper/papers.co-vt06-abstract-art-color-basic-background-pattern-23-wallpaper.jpg")';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
    }

      function detectTerminalSelect() {
        var tselect = overview.$children.find(child => child.$options.name === 'TerminalSelect')
        var vueselect = tselect.$children.find(child => child.$options.name === 'VueSelect')
        // This saved me: https://stackoverflow.com/questions/49755618/how-can-i-make-a-click-event-on-v-select
        vueselect.$on('input', function() {
            setTimeout(function() {
              refreshTableData();
            }, 50);
        });
    }

    // Wait for the DOM content to load
    document.addEventListener('DOMContentLoaded', function() {
        // Add a short delay to ensure elements are fully loaded
        setTimeout(function() {
            if (checkPage('dashboard') && !checkPage('dashboard/login') && !checkPage('dashboard/users/password_reset')) {
                // Call our setup function first.
                setupVue();

                // Call the function to add Est. To Completion column
                addEstToCompletionColumn();

                // Detect when we click a new option in <VueSelect>
                detectTerminalSelect();

                // Custon notification function, really just a way to visually instantly know the userscript is running without looking at console.
                notification("Tsubaki's GroundCloud - Version 0.0.3 - Report any issues to Trevor.", "#000000", "#73c714", "#ace36d", "#89b853");

            } else if (checkPage('dashboard/login')) {
                customizeLoginPage();
            } else if (checkPage('dashboard/users/password_reset')) {
                customizeForgotPasswordPage();
            }
        }, 1000); // Adjust the delay as needed
    });
})();
