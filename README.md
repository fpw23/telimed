### Purpose

This is a proof of concept for embedding Jitsi video and audio conferencing into a react app.  

### Summary

There are two APIs available from Jitsi to accomplish this: [Jitsi Meet](https://github.com/jitsi/jitsi-meet/blob/master/doc/api.md) and [Lib Jitsi Meet](https://github.com/jitsi/lib-jitsi-meet).  Jitsi Meet is a high level API that embeds the entire Jitsi Meet interface into a div within your app.  Styling is very limited and control is pretty limited but as far as easy of use goes, I had it working within a few minutes.  Lib Jitsi Meet is 
the lower level API used by Jitsi Meet to control the audio/video/text elements directly.  This route is much harder and took me about 4 days to figure out.  There are a lot of small concepts that you have to understand to get this API to work. 

### Findings

* You have to include the lib-jitsi-meet.js file in your html page and let it attach to the window.  This file is available from a Jitsi Server installation at the URL //your.jitsi.server.fqdn/libs/lib-jitsi-meet.min.js.  You can also use //your.jitsi.server.fqdn/external_api.js.  This will include both Meet and Lib Meet.  I chose to only include Lib Meet since I wanted full control over the UI.  This file is fully compressed and worthless for debugging.  To make it easier to debug I check out the [github library](https://github.com/jitsi/lib-jitsi-meet) directly and built it locally then run the webpack command without the -p option to get an uncompressed version with source maps.  

* The API has about 5 major parts and is pretty well documented [here](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md).  There is also an example app [here](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/example/example.js) but since I wanted to use react I did not even try running it so I am not sure if it works but I did reference it alot.

* The main pitfall in react is to not use any Jitsi API ojects as state or props.  Instead attach them to the component directly or to the window object and let your components reach them from there.  I tried a number of ways to pass them and it would seem to work but then I would get random errors of max state update calls.  Instead of passing them as props directly, I found passing a primative repersentation of them worked better.  For example, you have audio and video tracks which repersent the Mic and Webcam as API objects.  You have to attach these to audio and video html 5 tags for each remote participant.  In react world, it made sense to make a [remote participant component](https://github.com/fpw23/telimed/blob/master/src/RemoteTrack.js) to display them.  The problem is I could not pass the tracks to the component due to the max state errors.  The solution was to passed the unique IDs for these objects that look like GUIDs as strings.  In the component's did update, when I detected a change in ID I queried the window oject which was created by a parent component for the real API objects and stored them locally on my component but not as state.  This let me use react components to break up the display without passing the Lib Meet API objects directly.  

* The [example](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/example/example.js) was very helpful but I found that for local audio tracks creating an [audio tag](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/example/example.js#L51) and attaching the local mic to it would cause me to hear myself as an echo when I talked.  Even with the muted=true attribute it still happened.  If I just ignored creating an audio tag for the local mic it seems to work.

* To hear remote mics I had to [set](https://github.com/fpw23/telimed/blob/master/src/RemoteTrack.js#L72) the AudioOutputDeviceId for each track.  The example did this at the [mediadevices](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/example/example.js#L233) level but this did not work for me for some reason. 

### Conclusion

It is possible to use Jitsi lib to directly embed meet elements into your react app.  You can not take a traditional react approach and store Jitsi API objects as props or state or context.  You can still break your UI into components but those components will have to access some shared ojected outside React to use Jitsi.  This poc only supports audio and video, you see a working example of it below:

https://fpw23.github.io/telimed/

Open this URL on two different computers and point them to the same room.  You will seen yourself on the Me box and everyone else on the Them box.