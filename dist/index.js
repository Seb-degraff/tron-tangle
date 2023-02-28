import { Tangle, TangleState, UserId } from "./tangle.js"


const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

var player_index = 0;
var player_index_is_set = false;

async function run() {
  const imports = {
    env: {
      set_color: function (r, g, b, a) {
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      },
      draw_circle: function (x, y, radius) {
        context.beginPath();
        context.arc(x + 0.5, y + 0.5, radius, 0, 2 * Math.PI);
        context.fill();
      },
      draw_line: function (min_x, min_y, max_x, max_y) {
        context.beginPath();
        context.moveTo(min_x + 0.5, min_y + 0.5);
        context.lineTo(max_x + 0.5, max_y + 0.5);
        context.stroke();
      },
      set_player_index: function (_player_index) {
        // HACK: when we connect we ask the game to call set_player_index with a new player_index for us. We
        // prevent the effect of this getting called again on peers by checking player_index_is_set.
        // TODO: find how to do player ids properly with tangle.
        if (!player_index_is_set) {
          player_index_is_set = true;
          player_index = _player_index;
          console.log("set_player_index to " + player_index);
        }
      },
    }
  };  

  let fixed_update_interval = 1000 / 60;
  const result = await Tangle.instantiateStreaming(fetch("tron.wasm"), imports, {
    fixed_update_interval,
    on_state_change_callback: (state) => {
        if (state == TangleState.Connected) {
          // tangle.call("player_joined", [UserId]);
          // console.log("connected");
          exports.player_joined();
        }
    },
  });
  
  const exports = result.instance.exports;

  canvas.onpointerdown = async (event) => {
    var turnRight = (event.clientX > window.visualViewport.width/2) ? 1 : 0;
    exports.turn(turnRight, player_index);
  };

  document.addEventListener("keydown", (event) => {
    var left = event.code == "ArrowLeft";
    var right = event.code == "ArrowRight";
    if (left || right) {
      exports.turn(right, player_index);
    }
  });

  async function animation() {
    canvas.width = 256;
    canvas.height = 256;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Our Wasm module has a 'fixed_update' function that Tangle recognizes should be repeatedly called
    // as time progresses. By default `fixed_update` is called 60 times per second. 
    // Below when `draw` is called Tangle actually executes the `fixed_update` calls.

    // `callAndRevert` is a special type of function call that has no lasting effects.
    // Anything that occurs within this call is immediately reverted.
    // This allows `draw` to be called at different rates on different clients: perfect for rendering!
    exports.draw.callAndRevert();

    window.requestAnimationFrame(animation);
  }
  exports.reset();
  animation();
}

// copied from the tangle demo
const ANIMAL_NAMES = [
  "Albatross",
  "Alligator",
  "Alpaca",
  "Antelope",
  "Donkey",
  "Badger",
  "Bat",
  "Bear",
  "Bee",
  "Bison",
  "Buffalo",
  "Butterfly",
  "Camel",
  "Capybara",
  "Cat",
  "Cheetah",
  "Chicken",
  "Chinchilla",
  "Clam",
  "Cobra",
  "Crab",
  "Crane",
  "Crow",
  "Deer",
  "Dog",
  "Dolphin",
  "Dove",
  "Dragonfly",
  "Duck",
  "Eagle",
  "Elephant",
  "Elk",
  "Emu",
  "Falcon",
  "Ferret",
  "Finch",
  "Fish",
  "Flamingo",
  "Fox",
  "Frog",
  "Gazelle",
  "Gerbil",
  "Giraffe",
  "Goat",
  "Goldfish",
  "Goose",
  "Grasshopper",
  "Hamster",
  "Heron",
  "Horse",
  "Hyena",
  "Jaguar",
  "Jellyfish",
  "Kangaroo",
  "Koala",
  "Lemur",
  "Lion",
  "Lobster",
  "Manatee",
  "Mantis",
  "Meerkat",
  "Mongoose",
  "Moose",
  "Mouse",
  "Narwhal",
  "Octopus",
  "Okapi",
  "Otter",
  "Owl",
  "Panther",
  "Parrot",
  "Pelican",
  "Penguin",
  "Pony",
  "Porcupine",
  "Rabbit",
  "Raccoon",
  "Raven",
  "Salmon",
  "Seahorse",
  "Seal",
  "Shark",
  "Snake",
  "Sparrow",
  "Stingray",
  "Stork",
  "Swan",
  "Tiger",
  "Turtle",
  "Viper",
  "Walrus",
  "Wolf",
  "Wolverine",
  "Wombat",
  "Yak",
  "Zebra",
  "Gnome",
  "Unicorn",
  "Dragon",
  "Hippo",
];

const ADJECTIVES = [
  "Beefy",
  "Big",
  "Bold",
  "Brave",
  "Bright",
  "Buff",
  "Calm",
  "Charming",
  "Chill",
  "Creative",
  "Cute",
  "Cool",
  "Crafty",
  "Cunning",
  "Daring",
  "Elegant",
  "Excellent",
  "Fab",
  "Fluffy",
  "Grand",
  "Green",
  "Happy",
  "Heavy",
  "Honest",
  "Huge",
  "Humble",
  "Iconic",
  "Immense",
  "Jolly",
  "Jumbo",
  "Kind",
  "Little",
  "Loyal",
  "Lucky",
  "Majestic",
  "Noble",
  "Nefarious",
  "Odd",
  "Ornate",
  "Plucky",
  "Plump",
  "Polite",
  "Posh",
  "Quirky",
  "Quick",
  "Round",
  "Relaxed",
  "Rotund",
  "Shy",
  "Sleek",
  "Sly",
  "Spry",
  "Stellar",
  "Super",
  "Tactical",
  "Tidy",
  "Trendy",
  "Unique",
  "Vivid",
  "Wild",
  "Yappy",
  "Young",
  "Zany",
  "Zesty",
];

// copied from the tangle demo
function set_random_name() {
  if (!window.location.hash) {
      window.location.hash += ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      window.location.hash += ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      window.location.hash += ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
  }
}

set_random_name();
run();
