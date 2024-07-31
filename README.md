# Tsubaki's GroundCloud
![309496591-2dcd3fd4-eacd-4d4a-b100-21ff0d61e39f](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/9f9c76ea-e183-40bd-8c20-7cb21d2a4f8d)

_Please note that while the intention is to enhance usability, I aim not to cause any inconvenience or offense. Constructive feedback is always welcome. As I wish to expand upon and add features and requests that help improve GroundCloud for all._ **I will never add features or requests similar to features currently locked behind a GroundCloud PRO plan.**

## What is this?
The whole point of this userscript is to redesign GC, a website used by FXG contractors for various tasks. Initially, it started as an endeavor to add features and improvements to the website that I found helpful for my day-to-day operations. Originally, it was a .NET application utilizing the GC API, but I found this approach cumbersome. I wanted a solution that other managers could use without needing to download a program. Thus, this userscript was born. It's a userscript compatible with any userscript manager on your browser of choice - whether it's FireFox, Chrome, or others. Personally, I use ViolentMonkey, but they all function similarly.

I never had much interest in JavaScript nor made an effort to learn it. This project has been a learning journey for me, and some of that journey is reflected in the updates. Therefore, the code may appear messy and may not make sense at times. I'm doing my best with the knowledge I've gained, and if you have any input, please don't hesitate to let me know! I'm particularly interested in feature requests since I can only think of so much. Additionally, if you are from GC and have any questions or concerns, please reach out! I assure you, I'm not attempting to offend anyone with this project.

**This project, a userscript, modifies the website locally on your computer by executing JavaScript code on the page after it loads. It doesn't save any data, nor does it send or request any network information. All the source code is openly available here, and the sole purpose of this script is to enhance the user experience for convenience and quality of life.**

## Installation

Full installation instructions [can be found here](https://github.com/trevorftp/Tsubakis-GroundCloud/blob/main/Installion%20Instructions.md), it's easy!

As mentioned earlier, the script is a work in progress. I'm committed to pushing out updates, even if they aren't fully complete, just to keep everything up to date. Rest assured, any update I push is mostly functional for its intended purpose.

## Current Goodies And Updates

- **Login screen revamped.** 
- **New row (Est. To Completion) added to the dashboard table.** *Provides an estimate of a route's completion time.*
- **Increased information added to dashboard maps driver icons when clicked.** *Enhances driver icon functionality.*
- **Stop Progress bar redesign.** *Larger progress bars with stop data.*
- **Stop progress bars are color-coded based on the route's time to completion.** *Utilizes the "Time To Completion" row for color-coding.*
- **Renamed "Name" row to "Work Area".**
- **Added ability to dashboard notifications.**
- **Custom notifications with X.** *Visual indication of script activity.*
- **Topbar redesigned + sidebar collapsible at all times.** *Improved navigation.*
- **CSS/color overhaul.** *Significantly improved page performance.*
- **ILS and Real service card on dashboard.** *Enhanced dashboard functionality.*

## Future Plans

- **Route page stop icons replaced and color-coded to sequence color. (In-Progress)**
- **Show premium service packages and the type on the stop icon and stop list page.**
- **Add more data to exceptions popout on dashboard, such as time of exception and a search icon that takes you to package search page for that tracking number.**
- **A quick dispatch button on the dashboard that allows you to select from routes on the dashboard to dispatch.**
- **Add ability to select specific stops if multiple fall under the same address / location. Such as suites, apartments or a location with a delivery and pickup.**
- **Fully integrate the logic and functions with the Vue data, want to get away from getting any information directly from HTML.**
- **As always optimize and improve code.**

## Bugs

- **Login page sometimes doesn't update? Not a big deal.**
- ~~New sidebar icon slightly hard to click.~~
- **The routes page is not active, but is in the code. You can mess with it but its buggy.**
- ~~Time to completion estimates will sit at a low number if not all of the stops are "delivered".~~
- ~~Driver icon dialogs update, and original data is added after the custom data.~~
- ~~The top bar structure is slightly different on some pages. (Drivers, Fleet Map, CSA, Inspection Settings, Route Schedule, Training Schedule, Completed Tests, Settings, Contract IDs, Your Account) This causes issues on 10 of the 48 pages with the redesigned top bar. (High priority)~~
- ~~Table will revert to original data and look when you select a terminal. Refresh the page to restore the desired appearance. (I just need to detect this and update my data)~~
- ~~The new stop and package bars are not centered vertically!~~

And I am sure there are more bugs, just nothing I have found. It's not perfect.

## Screenshots

**Dashboard (Sidebar Collapsed)**
![git1](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/1ae96f66-eeac-45d4-a423-d9047f57930a)

**Dashboard (Sidebar Open)**
![git2](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/f35e6db7-6aca-4c03-9b4b-7c2e83cafb10)

**Login Screen**
![Screenshot 2024-02-23 125210](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/626668d6-6d55-4246-8efb-3f5c4f336a49)

**Routes Page (Stops are dim because they were delivered) (FUTURE FEATURE)**
![cap1](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/7af5eada-93e1-4ae8-8fa0-4ab0880c0765)

**Dashboard Overview Map**

![Capture](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/233259ab-dff7-4726-ab2d-730088b20ec9)

---
