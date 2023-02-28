Simple tron game written in C, compiled to web assembly. Multiplayer is archieved "externaly" using the [tangle](https://github.com/kettle11/tangle) library, the game itself has no idea it's being synced.

I use [zig cc](https://andrewkelley.me/post/zig-cc-powerful-drop-in-replacement-gcc-clang.html) to easily compile tron.c to wasm. See the command in build.sh
Serve the dist directory 
