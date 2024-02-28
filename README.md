# Tsubakis-GroundCloud
The whole point of this userscript is to redesign GC which is a website used by FXG contractors to do various things. Intially it started as me wanting to add features and things I thought the website could use. Or things I find helpful for my day-to-day operations. It started out as a .NET application that uses the GC API, but I found this to be painful and I wanted a solution that other managers can use without having to download a program.
So this was born, it's a userscript you can use with any userscript manager on your browser of choice. FireFox, Chrome, Etc.. I personally use tampermonkey, but they all funciton the same.

I never cared for Javascript or to learn it, I am actually learning it and choosing to retain information about it from this project, and some of that is reflected through the updates. So the code is and will be messy and may not make sense at points.
I am doing what I can with the information I have discovered. If you have any input please let me know! I am really wanting feature requests as I can only think of so much, also if you are GC and have any questions or concerns please reach out!
I am not trying to hurt any feelings with this project! 

Installion: Use your usersript manager of choice (I use TamperMonkey) paste the contents of the .JS into a script and set it to run at "document-body" and bam you're in!

As stated the script is a work in progress, I will always push out my updates even if they aren't fully complete just to keep up to date! Any update I push is mostly working for what it's used for. So nothing crazy.

**Current Goodies:** <br />
1.) Login screen revamped. <br />
3.) New row (Est. To Completeion) added to the dashboard table. This gives you an hour and minute estimate of that routes completeion. <br />
4.) Increased information added to dashboard maps driver icons when clicked. <br />
5.) Stop Progress bar redesign, thicker bars with stop data inside of them. <br />
6.) Stop progress bars are color coded based on that routes time to completeion. <br />
7.) Renamed "Name" row to "Work Area". <br />
8.) Custom notifications with X, really just used to visually show the script is working. <br />
9.) Topbar redesigned + sidebar collapsible at all times. <br />

**Future Plans:** <br />
  ~~1.) Always be able to collapse sidebar. (Code is there just need to make it work)~~ <br />
  2.) Route page stop icons replaced and color coded to sequence color. <br />
  3.) Clean up CSS, too many random things for it. <br />
  4.) ??? <br />

**Bugs:** <br />
  ~~1.) Table will revert to original data and look when you select a terminal, refresh the page to get the look back. (I just need to detect this and update my data)~~ <br />
  2.) The new stop and package bars are not centered vertically! <br />
  3.) Time to completion estimates will sit at a low number if not all of the stops are "delivered". <br />
  4.) Login page sometimes doesnt update? Not a big deal. <br />
  5.) Driver icon dialogs update and original data is added after the custom data.<br />
  6.) The topbar structure is slightly different on some pages? This causes issues on select pages with the redesigned topbar. (High priority)
  7.) New sidebar icon slightly hard to click. <br />

And I am sure there are more bugs, just nothing I have found. It's not perfect.

![bg1](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/7d5200bc-a1f4-4b0e-a816-90fd428333c4)
![bg2](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/1ee7ae0a-779c-4ac1-a779-7141f42bd99c)
![Capture](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/233259ab-dff7-4726-ab2d-730088b20ec9)
![Screenshot 2024-02-23 125210](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/626668d6-6d55-4246-8efb-3f5c4f336a49)

