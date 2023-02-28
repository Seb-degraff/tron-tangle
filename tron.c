#include <stdbool.h>

#define GAME_ARENA_SIZE 256

// imported functions provided by the javascript part
void set_color(float r, float g, float b, float a);
void draw_circle(float x, float y, float rad);
void draw_line(float min_x, float min_y, float max_x, float max_y);
void set_player_index(int player_index);

typedef struct Vec2
{
    float x;
    float y;
}
Vec2;

typedef struct Player
{
    int  waypoints_count;
    Vec2 waypoints[1000]; 
    int dir;
    bool dead;
}
Player;

#define PLAYER_COUNT 4

Vec2 starting_positions[] = {
    (Vec2) { GAME_ARENA_SIZE / 3, (GAME_ARENA_SIZE / 3) * 2 },
    (Vec2) { (GAME_ARENA_SIZE / 3)*2, (GAME_ARENA_SIZE / 3) * 2 },
    (Vec2) { GAME_ARENA_SIZE / 3 - 30, GAME_ARENA_SIZE / 3 },
    (Vec2) { (GAME_ARENA_SIZE / 3)*2 + 30, GAME_ARENA_SIZE / 3 },
};

int starting_dirs[] = { 3, 3, 1, 1, };


// game state
Player players[PLAYER_COUNT];
int restart_timer;
int connected_players;

#define EXPORT __attribute__((visibility("default")))

EXPORT void player_joined(void)
{
    set_player_index(connected_players);
    connected_players++;
}

EXPORT void reset(void)
{
    restart_timer = 0;
    for (int i = 0; i < PLAYER_COUNT; i++) {
        Player* p = &players[i];
        *p = (Player) {0};
        p->waypoints[p->waypoints_count++] = starting_positions[i];
        p->waypoints[p->waypoints_count] = p->waypoints[p->waypoints_count-1];
        p->dir = starting_dirs[i];
    }
}

EXPORT void draw(void)
{
    for (int i = 0; i < PLAYER_COUNT; i++) {
        Player* p = &players[i];
        if (p->dead) {
            continue;
        }
        if (i == 0) {
            set_color(255,0,0,255);
        } else if (i == 1) {
            set_color(0,255,0,255);
        } else if (i == 2) {
            set_color(0,0,255,255);
        } else if (i == 3) {
            set_color(255,0,255,255);
        }
        draw_circle(p->waypoints[p->waypoints_count].x, p->waypoints[p->waypoints_count].y, 2);
        for (int i = 0; i < p->waypoints_count; i++) {
            draw_line(p->waypoints[i].x, p->waypoints[i].y, p->waypoints[i+1].x, p->waypoints[i+1].y);
        }
    }
}

// As our lines are all perpendicular, we could take a more efficent approach, even in how we store
// them. But this is fast enough so I won't bother.
bool line_line_collision(Vec2 a, Vec2 b, Vec2 c, Vec2 d)
{
    float denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
    float numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
    float numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));

    // Detect coincident lines (has a problem, read below)
    if (denominator == 0) return numerator1 == 0 && numerator2 == 0;
    
    float r = numerator1 / denominator;
    float s = numerator2 / denominator;

    return (r >= 0 && r <= 1) && (s >= 0 && s <= 1);
}

bool collisions_check(Player* p)
{
    Vec2 a1 = p->waypoints[p->waypoints_count-1];
    Vec2 a2 = p->waypoints[p->waypoints_count];

    // arena borders
    if (a2.x < 0 || a2.x > GAME_ARENA_SIZE || a2.y < 0 || a2.y > GAME_ARENA_SIZE) {
        return true;
    }

    // collision with other players and ourself
    for (int pi = 0; pi < PLAYER_COUNT; pi++) {
        Player* other = &players[pi];
        if (other->dead) {
            continue;
        }
        int past_last_idx = other->waypoints_count - (other == p ? 2 : 0); // don't check our last segment with itself
        for (int k = 0; k < past_last_idx; k++) {
            Vec2 b1 = other->waypoints[k];
            Vec2 b2 = other->waypoints[k+1];
            if (line_line_collision(a1, a2, b1, b2)) {
                return true;
            }
        }
    }

    return false;
}

// Fixed update
void __attribute__((visibility("default"))) fixed_update(void)
{
    int alive_count = 0;

    for (int i = 0; i < PLAYER_COUNT; i++) {
        Player* p = &players[i];
        if (p->dead) {
            continue;
        }
        alive_count++;
        Vec2 pos = p->waypoints[p->waypoints_count];
        if (p->dir == 0) {
            pos.x += 1;
        }
        if (p->dir == 1) {
            pos.y += 1;
        }
        if (p->dir == 2) {
            pos.x -= 1;
        }
        if (p->dir == 3) {
            pos.y -= 1;
        }
        p->waypoints[p->waypoints_count] = pos;

        // check collisions of last segment
        if (collisions_check(p)) {
            p->dead = true;
        }
    }

    if (alive_count <= 1) {
        restart_timer++;
        if (restart_timer > 130) {
            reset();
        }
    }
}

// Called whenever a user clicks. Each user has a unique ID.
// Spawn a ball when the player clicks.
void __attribute__((visibility("default"))) turn(unsigned int turn_right, unsigned int playerIndex) {
    Player* p = &players[playerIndex];
    p->waypoints_count++;
    p->waypoints[p->waypoints_count] = p->waypoints[p->waypoints_count-1];
    p->dir += turn_right ? 1 : -1;
    if (p->dir == 4) p->dir = 0;
    if (p->dir == -1) p->dir = 3;
}
