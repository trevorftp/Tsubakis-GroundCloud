// ==UserScript==
// @name         Tsubaki's GroundCloud
// @namespace    https://github.com/trevorftp
// @version      0.0.6
// @description  Redesign GroundCloud.io
// @author       Trevor Derifield
// @match        https://groundcloud.io/*
// @downloadURL https://github.com/trevorftp/Tsubakis-GroundCloud/raw/main/Tsubaki's%20GroundCloud.user.js
// @updateURL	https://github.com/trevorftp/Tsubakis-GroundCloud/raw/main/Tsubaki's%20GroundCloud.user.js
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

    var appRoot, vueInstance, authWrapper, overview, overviewMap, routeList, routeDetails;

    function checkPage(page, pattern) {
        // Check if only one argument is provided
        if (arguments.length === 1) {
            var regex = new RegExp('^https?://[^/]+/' + page + '/?$');
            return regex.test(window.location.href);
        }
        // Check if two arguments are provided
        else if (arguments.length === 2) {
            var regex = new RegExp('^https?://[^/]+/' + page + '/' + pattern);
            return regex.test(window.location.href);
        }
    }

    // New function that is a little smarter,
    // Dashboard | <Root> -> <AuthWrapper> -> <Overview> -> <RouteList> and <OverviewMap>
    // Routes | <Root> -> <AuthWrapper> -> <RouteDetails>
    function setupVue(app) {
        appRoot = document.querySelector(app);
        if (appRoot) {
            vueInstance = appRoot.__vue__;
            if (vueInstance) {
                authWrapper = vueInstance.$children.find(child => child.$options.name === 'AuthWrapper');
                if (authWrapper) {
                    if (authWrapper.$children.find(child => child.$options.name === 'Overview')) {
                        overview = authWrapper.$children.find(child => child.$options.name === 'Overview');
                        overviewMap = overview.$children.find(child => child.$options.name === 'OverviewMap');
                        if (overviewMap) {
                            routeList = overview.$children.find(child => child.$options.name === 'RouteList');
                        }
                    }
                    else if (authWrapper.$children.find(child => child.$options.name === 'RouteDetails')) {
                      routeDetails = authWrapper.$children.find(child => child.$options.name === 'RouteDetails');
                    } else { console.log('No children could be found.'); }
                } else { console.log('AuthWrapper could not be found.'); }
            } else { console.log('The Vue instance could not be found.'); }
        } else { console.log('The Vue instance could not be found.'); }
    }

    function notification(message, textColor, iconColor, bgColor, borderColor) {
        // Create a new div element for the notification
        var notificationDiv = document.createElement('div');
        notificationDiv.className = 'route-list__stops_flagged alert';
        notificationDiv.setAttribute('data-v-33da10de', ''); // Set data-v attribute

        // Apply custom styles using CSS classes
        notificationDiv.classList.add('custom-notification');
        notificationDiv.style.color = textColor;
        notificationDiv.style.fontWeight = '400';
        notificationDiv.style.backgroundColor = bgColor;
        notificationDiv.style.borderColor = borderColor;

        // Create a close button (X)
        var closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.setAttribute('data-v-33da10de', ''); // Set data-v attribute
        closeButton.innerHTML = '&times;'; // Use HTML entity for X
        closeButton.style.color = '#FFF';
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
        if (!routeListRow) {
            console.error('Route-list row element not found!');
            return;
        }

        // Find the card-body element under the route-list row
        var cardBody = routeListRow.querySelector('.card-body');
        if (!cardBody) {
            console.error('Card-body element not found under route-list row!');
            return;
        }

        // Insert the new notification before the first child of card-body (at the top)
        cardBody.insertBefore(notificationDiv, cardBody.firstChild);

        // Handle click event for close button using event delegation
        cardBody.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('close')) {
                // Remove the notification when the close button is clicked
                notificationDiv.remove();
            }
        });
    }

    function refreshTableData() {
        createServiceCard();
        // Find all table rows
        var tableRows = document.querySelectorAll('.route-list-row__row');
        // Iterate through each table row
        tableRows.forEach(function(row, index) {
            // Check if the custom row already exists
            if (!row.querySelector('.route-list-row__est-comp')) {
                addEstToCompletionColumn();
            }
        });
    }

    function handleCircleClick(circle) {
        var ariaLabel = circle.getAttribute('aria-label');
        var dialog = document.querySelector('.gm-style-iw-d');
        if (!dialog || !ariaLabel) return;

        // Create a map for quick lookup of drivers.
        var driversMap = {};
        overviewMap.driversWithLastLocations.forEach(function(driver) {
            var fullNameAbbreviation = driver.user.first_name.charAt(0) + driver.user.last_name.charAt(0);
            driversMap[fullNameAbbreviation] = driver;
        });

        // Iterate through route days once and store relevant information in a map
        var routeDayInfoMap = {};
        overviewMap.routeDays.forEach(function(routeDay, index) {
            routeDayInfoMap[routeDay.id] = {
                routeListRoute: routeList.routeDays[index],
                stopStats: routeList.stopStatsByRouteDay[routeDay.id],
                milesTotal: parseFloat(routeDay.miles_total.toFixed())
            };
        });

        // Look up driver information using abbreviation
        var driver = driversMap[ariaLabel];
        if (!driver) return;

        // Find the corresponding route day
        var routeDay = driver.last_location.route_day;
        var routeDayInfo = routeDayInfoMap[routeDay];
        if (!routeDayInfo) return;

        // Generate new content for the dialog
        var newContent = `WA: ${routeDayInfo.routeListRoute.route.name}<br>Stops: ${routeDayInfo.stopStats.completed} / ${routeDayInfo.stopStats.total} (${routeDayInfo.stopStats.total - routeDayInfo.stopStats.completed} Left)<br>Est. Miles: ${routeDayInfo.milesTotal}`;
        dialog.insertAdjacentHTML('beforeend', newContent);
    }

    function editOverviewMap() {
      var fleetMap = document.getElementById('fleet-map-pane');

      fleetMap.addEventListener('click', function(event) {
          var circle = event.target.closest('div[role="button"][style*="width: 50px;"][style*="height: 50px;"]');
          if (!circle) return; // Ignore clicks outside of circles

          handleCircleClick(circle);
      });

      // Get the dialog element
      var dialog = document.querySelector('.gm-style-iw-d');

      // Oserve changes to the parent element
      var observer = new MutationObserver(function(mutationsList, observer) {
          for (var mutation of mutationsList) {
              if (mutation.target.classList.contains('gm-style-iw-d')) {
                  observer.disconnect();
                  break;
              }
          }
      });

      // Start observing mutations on the parent element
      observer.observe(fleetMap, { childList: true });
    }

    function createServiceCard() {
        let totalPackageStats = 0;
        let totalImpactStats = 0;
        let totalExceptionStats = 0;

        // Iterate through packageStatsByRouteDay
        Object.values(routeList.packageStatsByRouteDay).forEach(routeStats => {
            if (routeStats && typeof routeStats === 'object') {
                totalPackageStats += routeStats.total || 0; // Add total, defaulting to 0 if undefined
            }
        });

        // Iterate through impactStatsByRouteDay
        Object.values(routeList.impactStatsByRouteDay).forEach(routeStats => {
            if (routeStats && typeof routeStats === 'object') {
                totalImpactStats += routeStats.completed || 0; // Add completed, defaulting to 0 if undefined
            }
        });

        // Iterate through impactStatsByRouteDay
        Object.values(routeList.exceptionStatsByRouteDay).forEach(routeStats => {
            if (routeStats && typeof routeStats === 'object') {
                totalExceptionStats += routeStats.completed || 0; // Add completed, defaulting to 0 if undefined
            }
        });

        const ilsRatio = totalPackageStats / (totalPackageStats + totalImpactStats) * 100;
        const realRatio = totalPackageStats / (totalPackageStats + totalImpactStats + totalExceptionStats) * 100;

        if (!document.querySelector('.card.mx-1.route-list-totals-bar-service-scores')) {
            const serviceCard = document.createElement('div');
            serviceCard.setAttribute('data-v-0261712b', '');
            serviceCard.classList.add('card', 'mx-1', 'route-list-totals-bar-service-scores');

            // Create card body
            const cardBody = document.createElement('div');
            cardBody.setAttribute('data-v-0261712b', '');
            cardBody.classList.add('card-body', 'p-2');

            // Create container for left side elements
            const leftContainer = document.createElement('div');
            leftContainer.classList.add('float-left');
            leftContainer.style.textAlign = 'left'; // Set text-align: left

            // Create container for right side elements
            const rightContainer = document.createElement('div');
            rightContainer.classList.add('float-right');
            rightContainer.style.textAlign = 'right'; // Set text-align: right

            // Create h3 element for the left side
            const ilsH3 = document.createElement('h3');
            ilsH3.setAttribute('data-v-0261712b', '');
            ilsH3.classList.add('mb-0', 'text-nowrap');
            ilsH3.textContent = 'ILS';

            // Create h3 element for the right side
            const realH3 = document.createElement('h3');
            realH3.setAttribute('data-v-0261712b', '');
            realH3.classList.add('mb-0', 'text-nowrap');
            realH3.textContent = 'Real';

            const ilsText = document.createTextNode(ilsRatio.toFixed(1) + '%');

            const realText = document.createTextNode(realRatio.toFixed(1) + '%');

            // Append elements to their respective containers
            leftContainer.appendChild(ilsH3);
            leftContainer.appendChild(ilsText);
            rightContainer.appendChild(realH3);
            rightContainer.appendChild(realText);

            // Append containers to the card body
            cardBody.appendChild(leftContainer);
            cardBody.appendChild(rightContainer);

            // Append card body to the new card
            serviceCard.appendChild(cardBody);

            const cardDeck = document.querySelector('.route-list-totals-bar.card-deck.mx-0');

            cardDeck.insertBefore(serviceCard, cardDeck.firstElementChild);
        } else {
            const ilsText = document.querySelector('.card.mx-1.route-list-totals-bar-service-scores .float-left').lastChild;
            const realText = document.querySelector('.card.mx-1.route-list-totals-bar-service-scores .float-right').lastChild;
            ilsText.textContent = ilsRatio.toFixed(1) + '%';
            realText.textContent = realRatio.toFixed(1) + '%';
        }
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
                estCompTh.setAttribute('data-sortby', 'Completion'); // Set data-sortby attribute so we can find it later!!
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

                    var stopProgress = stopsTd.querySelector('.progress');
                    var packageProgress = packagesTd.querySelector('.progress');

                    var stopContainer = stopsTd.querySelector('.gc-overview-progress-bar.progress-bar-width');
                    var packageContainer = packagesTd.querySelector('.gc-overview-progress-bar.progress-bar-width');
                    var stopTextRow = stopsTd.querySelector('.row.text-nowrap');
                    var packageTextRow = packagesTd.querySelector('.row.text-nowrap');

                    if (stopContainer && packageContainer && stopTextRow && packageTextRow && stopProgress && packageProgress) {
                        stopProgress.style.height = '30px';
                        packageProgress.style.height = '30px';
                        // Append the text row to the container
                        stopContainer.appendChild(stopTextRow);
                        packageContainer.appendChild(packageTextRow);

                        stopTextRow.style.marginLeft = '0px';
                        stopTextRow.style.marginTop = '-25px';
                        stopTextRow.style.textAlign = 'center';
                        stopTextRow.style.width = '100%';

                        packageTextRow.style.marginLeft = '0px';
                        packageTextRow.style.marginTop = '-25px';
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
                            var stopsValue = stopStats.total - stopStats.completed;
                            var stopsText = stopsValue;
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
                                stopProgressBar.style.backgroundColor = '#f16e6e'; // Red color
                                packageProgressBar.style.backgroundColor = '#f16e6e'; // Red color
                            } else if (hours >= 8) {
                                stopProgressBar.style.backgroundColor = '#f9c939'; // Yellow color
                                packageProgressBar.style.backgroundColor = '#f9c939'; // Yellow color
                            } else {
                                stopProgressBar.style.backgroundColor = '#34bddf'; // Green color
                                packageProgressBar.style.backgroundColor = '#34bddf'; // Green color
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

    function addCustomCSS() {
        // Get the elements to move
        var topbarDiv = document.querySelector('.topbar');
        var dashboardDiv = document.querySelector('.dashboard');
        var sidebarToggleBtn;

        // hehe.
        document.querySelector('.nav-item.nav-item__upgrade_to_pro_tier').remove();

        // Check if both elements exist
        if (topbarDiv) {
            var firstChild = dashboardDiv ? dashboardDiv.firstElementChild : document.body.firstElementChild;
            if (dashboardDiv) {
                dashboardDiv.insertBefore(topbarDiv, firstChild);
            } else {
                document.body.insertBefore(topbarDiv, firstChild);
            }

            var toggleButton = topbarDiv.querySelector('.nav-toggler.nav-toggler-md.sidebar-toggler');
            if (toggleButton) {
                toggleButton.remove();
            }

            var dashhead = topbarDiv.querySelector('.dashhead');
            sidebarToggleBtn = document.querySelector('.sidebar-toggle-button');
            if (dashhead) {
                var logoDiv = document.querySelector('.logo');
                if (logoDiv) {
                    dashhead.insertBefore(logoDiv, dashhead.firstChild);
                }
                if (!sidebarToggleBtn) {
                    sidebarToggleBtn = document.createElement('button');
                    sidebarToggleBtn.classList.add('sidebar-toggle-button');
                    sidebarToggleBtn.ariaLabel = 'Toggle Sidebar';
                    dashhead.insertBefore(sidebarToggleBtn, dashhead.firstChild);
                }
            }

            var wrapper = document.getElementById('wrapper');
            var sidebarWrapper = document.getElementById('sidebar-wrapper');

            var wrapperStyle = getComputedStyle(wrapper);
            var sidebarWrapperStyle = getComputedStyle(sidebarWrapper);

            wrapper.style.paddingLeft = '0px';
            sidebarWrapper.style.width = '0px';

            sidebarToggleBtn.addEventListener('click', function() {
                var newWrapperPadding = wrapperStyle.paddingLeft === '250px' ? '0px' : '250px';
                var newSidebarWidth = sidebarWrapperStyle.width === '250px' ? '0px' : '250px';

                wrapper.style.paddingLeft = newWrapperPadding;
                sidebarWrapper.style.width = newSidebarWidth;

                sidebarToggleBtn.classList.toggle('active');
                sidebarToggleBtn.classList.toggle('toggle');
            });
        }

        // Add custom styles
        var style = document.createElement('style');
        style.textContent = `
          .dashhead::before, .dashhead::after {
              display: none;
          }
          a {
              color: #0e5777;
          }
          body {
              color: #0d0a05;
              background-color: #fcfaf6;
          }
          .custom-notification {
              background: linear-gradient(160deg, #f9c939, #694d89);
              color: #0d0a05;
          }
          .logo {
              padding-left: 12%;
          }
          .topbar {
              margin-left: 0px;
              box-shadow: 0 0px 0px rgba(0,0,0,0.2)
              padding: 10px 10px 0 15px;
              background: #fcfaf6;
          }
          .topbar.legacy {
              margin-left: 0px;
              box-shadow: 0 0px 0px rgba(0,0,0,0.2)
              padding: 10px 10px 0 15px;
              background: #fcfaf6;
          }
          .topbar .dashhead .dashhead-subtitle {
              color: #0D0A05;
          }
          #sidebar-wrapper {
              margin-top: 78px;
              background: #f4f2ee;
          }
          .dashhead {
              display: flex;
              align-items: center;
              justify-content: space-between;
          }
          .card {
              background-color: #f4f2ee;
          }
          .card.mx-1 {
              background-color: #f0eee9;
          }
          button.btn.btn-secondary.btn-xs {
              background-color: #c0e8ef;
              color: #0D0A05;
          }
          .progress {
              background-color: #dfdedf;
          }
          .progress-bar {
              background-color: #41a0cf !important;
          }
          .table {
              color: #0D0A05;
          }
          .nav-pills .nav-item.active:not(.nav-nested) .nav-link, .nav-pills .nav-item:not(.nav-nested) .nav-link.active {
              color: #694d89;
              background-color: #cde8eb;
              border-radius: 25px;
          }
          .sidebar-nav li a {
              color: #504866;
              font-weight: 300;
          }
          .sidebar-nav li a:hover {
              color: #694d89;
              background-color: #ffffff00;
              font-weight: 500;
          }
          .sidebar-toggle-button {
              background-color: transparent;
              border: none;
              cursor: pointer;
              height:3px;
              background:#555;
              margin-top: 10px;
              padding: 0px 15px;
              position: relative;
          }

          .sidebar-toggle-button.toggle {
            background:transparent;
          }

          /* Default state: Three horizontal lines */
          .sidebar-toggle-button::before,
          .sidebar-toggle-button::after {
              content: '';
              position: absolute;
              left: 0;
              width: 100%;
              height: 3px;
              background-color: #000;
              transition: transform 0.3s ease;
          }

          .sidebar-toggle-button::before {
              top: -8px; /* Adjusted vertical position */
          }

          .sidebar-toggle-button::after {
              top: 8px; /* Adjusted vertical position */
          }
          /* Active state: "X" symbol */
          .sidebar-toggle-button.active::before {
              top:0;
              transform:rotate(-45deg);
              background:#10b4da;
          }

          .sidebar-toggle-button.active::after {
              top:0;
              transform:rotate(45deg);
              background:#10b4da;
          }
          .alert-danger {
              border-color: #917b7e;
          }
          .dashhead-titles {
              order: 3;
          }
        `;
        document.head.appendChild(style);
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
        if (overview) {
            var tselect = overview.$children.find(child => child.$options.name === 'TerminalSelect');
            if (tselect) {
                var vueselect = tselect.$children.find(child => child.$options.name === 'VueSelect');
                if (vueselect) {
                    vueselect.$on('input', function() {
                        setTimeout(refreshTableData, 50);
                    });
                }
            }
        }
    }
    // __e3_ seems to be events?
    // routeMarkers everything (drawn on the map essentially.)
    // routeMarker objects - .info seems to be the info for the dialog box that shows when you click a stop.
    // label is clearly the label number and text color
    // icon is the stop icon, set by the
    // stopId - in this example first stop was pickup and id was 4290435321.

    // Need to go over each object in routeMarkers, Ignore stops that arent delivery or pickup markers.
    function routePage() {
        //routeDetails.truckIcon = 'https://i.imgur.com/QP9rANe.png';
        // Iterate through stops array
        for (let stop of routeDetails.routeDay.stops) {
            // Get the stop ID
            let sid = stop.sid;

            // Convert sid to a number
            let sidNumber = parseInt(sid);

            // Determine the icon URL based on the sid number
            let iconUrl;
            let iconUrlDim;
            if (!sid || isNaN(sidNumber) || sid == 0) {
                // If sid is null, doesn't exist, or is not a number
                iconUrl = 'https://tsubaki.moe/default_target.png';
                iconUrlDim = 'https://tsubaki.moe/default_target_dimmed.png';
            } else if (sidNumber >= 0 && sidNumber < 2000) {
                iconUrl = 'https://tsubaki.moe/yellow_target.png';
                iconUrlDim = 'https://tsubaki.moe/yellow_target_dimmed.png';
            } else if (sidNumber >= 2000 && sidNumber < 3000) {
                iconUrl = 'https://tsubaki.moe/red_target.png';
                iconUrlDim = 'https://tsubaki.moe/red_target_dimmed.png';
            } else if (sidNumber >= 3000 && sidNumber < 4000) {
                iconUrl = 'https://tsubaki.moe/green_target.png';
                iconUrlDim = 'https://tsubaki.moe/green_target_dimmed.png';
            } else if (sidNumber >= 4000 && sidNumber < 5000) {
                iconUrl = 'https://tsubaki.moe/green_target.png';
                iconUrlDim = 'https://tsubaki.moe/cyan_target_dimmed.png';
            } else if (sidNumber >= 5000 && sidNumber < 6000) {
                iconUrl = 'https://tsubaki.moe/pink_target.png';
                iconUrlDim = 'https://tsubaki.moe/pink_target_dimmed.png';
            } else if (sidNumber >= 6000 && sidNumber < 7000) {
                iconUrl = 'https://tsubaki.moe/grey_target.png';
                iconUrlDim = 'https://tsubaki.moe/grey_target_dimmed.png';
            } else if (sidNumber >= 7000 && sidNumber < 8000) {
                iconUrl = 'https://tsubaki.moe/orange_target.png';
                iconUrlDim = 'https://tsubaki.moe/orange_target_dimmed.png';
            } else if (sidNumber >= 8000 && sidNumber < 9000) {
                iconUrl = 'https://tsubaki.moe/purple_target.png';
                iconUrlDim = 'https://tsubaki.moe/purple_target_dimmed.png';
            } else {
                // If sid is any other value
                iconUrl = 'https://tsubaki.moe/default_target.png';
                iconUrlDim = 'https://tsubaki.moe/default_target_dimmed.png';
            }

            // Find corresponding routeMarker with the same stopId
            let matchingRouteMarker = routeDetails.routeMarkers.find(marker => marker.stopId === stop.id);
            matchingRouteMarker.icon.url = iconUrl;
            // If a matching routeMarker is found
            if (matchingRouteMarker && stop.stop_type == 'delivery') {
                if (stop.combined_status == null || !stop.combined_status.delivered) {
                    matchingRouteMarker.icon.url = iconUrl;
                    Vue.set(routeDetails, 'stopIcon', iconUrl);
                } else if (stop.combined_status.delivered) {
                    matchingRouteMarker.icon.url = iconUrlDim;
                    Vue.set(routeDetails, 'stopDeliveredIcon', iconUrlDim);
                }
            }
        }
    }

    function removeStopParameterFromURL() {
        // Get the current URL
        var currentURL = window.location.href;

        // Check if the URL contains the 'stop' parameter
        if (currentURL.includes('?stop=')) {
            // Split the URL into base URL and parameters
            var parts = currentURL.split('?');
            var baseURL = parts[0];

            // Get the remaining parameters excluding the 'stop' parameter
            var remainingParameters = parts[1].split('&').filter(function(param) {
                return !param.startsWith('stop=');
            });

            // Construct the updated URL without the 'stop' parameter
            var updatedURL = baseURL + (remainingParameters.length > 0 ? '?' + remainingParameters.join('&') : '');

            // Update the URL without reloading the page
            window.history.replaceState({}, document.title, updatedURL);
        }
    }

    // Wait for the DOM content to load
    document.addEventListener('DOMContentLoaded', function() {
        // Add a short delay to ensure elements are fully loaded
        setTimeout(function() {
            if (checkPage('dashboard')) {
                setupVue('#overview_viewapp');
                addEstToCompletionColumn();
                detectTerminalSelect();
                notification("Tsubaki's GroundCloud - Version 0.0.6 - Report any issues on Github.", "#0D0A05", "#000000", "#0D0A05", "#0D0A05");
                editOverviewMap();
                createServiceCard();
            }
            else if (checkPage('dashboard/login')) {
                customizeLoginPage();
            }
            else if (checkPage('dashboard/users/password_reset')) {
                customizeForgotPasswordPage();
            }
            else if (checkPage('dashboard/routes', '\\d+/days/\\d+/')) {
                //setupVue('#route_details_viewapp');
                //setTimeout(routePage, 1000);
            }

            addCustomCSS();
        }, 1500);
    });
})();
