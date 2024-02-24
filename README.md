# Tsubakis-GroundCloud
The whole point of this userscript is to redesign GC which is a website used by FXG contractors to do various things. Intially it started as me wanting to add features and things I thought the website could use. Or things I find helpful for my day-to-day operations. It started out as a .NET application that uses the GC API, but I found this to be painful and I wanted a solution that other managers can use without having to download a program.
So this was born, it's a userscript you can use with any userscript manager on your browser of choice. FireFox, Chrome, Etc.. I personally use tampermonkey, but they all funciton the same.

I never cared for Javascript or to learn it, I am actually learning it and choosing to retain information about it from this project, and some of that is reflected through the updates. So the code is and will be messy and may not make sense at points.
I am doing what I can with the information I have discovered. If you have any input please let me know! I am really wanting feature requests as I can only think of so much, also if you are GC and have any questions or concerns please reach out!
I am not trying to hurt any feelings with this project! 

Installion: Use your usersript manager of choice (I use TamperMonkey) paste the contents of the .JS into a script and set it to run at "document-body" and bam you're in!

As stated the script is a work in progress, I will always push out my updates even if they aren't fully complete just to keep up to date! Any update I push is mostly working for what it's used for. So nothing crazy.

**Current "Features":**
1. Login screen revamped.
2. New row (Est. To Completeion) added to the dashboard table. This gives you an hour and minute estimate of that routes completeion.
3. Stop Progress bar redesign, thicker bars with stop data inside of them.
4. Stop progress bars are color coded based on that routes time to completeion.
5. Renamed "Name" row to "Work Area".
6. Custom notifications with X, really just used to visually show the script is working.

**Future "Features":**
1. Always be able to collapse sidebar. (Code is there just need to make it work)
2. ???

**Bugs: ** <br />
~~1. Table will revert to original data and look when you select a terminal, refresh the page to get the look back. (I just need to detect this and update my data)~~ <br />
2. The new stop and package bars are not centered vertically! <br />
3. Time to completion estimates will sit at a low number if not all of the stops are "delivered". <br />
4. Login page sometimes doesnt update? Not a big deal. <br />

And I am sure there are more bugs, just nothing I have found. It's not perfect.

![1f7d7e03f9746ac59a86ac28e8df9fe9 (1)](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/3a987fd4-2de8-4bcc-a589-77e71cb47fa3)
![Screenshot 2024-02-23 125210](https://github.com/trevorftp/Tsubakis-GroundCloud/assets/17115206/626668d6-6d55-4246-8efb-3f5c4f336a49)

