import {
  BUILD_PADS,
  CORE_MAX_HEALTH,
  ENEMY_DEFINITIONS,
  INTERMISSION_SECONDS,
  MAX_EVENT_FEED,
  PASSIVE_INCOME_AMOUNT,
  PASSIVE_INCOME_INTERVAL,
  PATH_POINTS,
  STARTING_RESOURCES,
  TOWER_DEFINITIONS,
  WAVE_DEFINITIONS,
  type BeamEffect,
  type BuildPad,
  type EnemyState,
  type EnemyType,
  type GameEvent,
  type GameEventType,
  type GameMode,
  type GameSnapshot,
  type PlayerPresence,
  type Point,
  type SessionStatus,
  type TowerState,
  type TowerType,
  type WaveDefinition,
} from '../../shared/game-data.ts';

interface SpawnInstruction {
  type: EnemyType;
  delay: number;
}

export interface RuntimeGameState {
  roomId: string | null;
  mode: GameMode;
  status: SessionStatus;
  coreHealth: number;
  resources: number;
  waveNumber: number;
  currentWaveLabel: string;
  activeWave: boolean;
  nextWaveIn: number;
  towers: TowerState[];
  enemies: EnemyState[];
  buildPads: BuildPad[];
  players: PlayerPresence[];
  beams: BeamEffect[];
  eventFeed: GameEvent[];
  pendingSpawns: SpawnInstruction[];
  spawnCooldown: number;
  passiveIncomeCooldown: number;
  clock: number;
  sequence: number;
}

interface PathSegment {
  start: Point;
  end: Point;
  length: number;
}

const PATH_SEGMENTS: PathSegment[] = PATH_POINTS.slice(0, -1).map(
  (point, index) => {
    const nextPoint = PATH_POINTS[index + 1];
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    return {
      start: point,
      end: nextPoint,
      length: Math.hypot(dx, dy),
    };
  },
);

const TOTAL_PATH_LENGTH = PATH_SEGMENTS.reduce(
  (sum, segment) => sum + segment.length,
  0,
);

const clonePoint = (point: Point): Point => ({ x: point.x, y: point.y });

const cloneBuildPads = (): BuildPad[] =>
  BUILD_PADS.map((pad) => ({
    ...pad,
    position: clonePoint(pad.position),
  }));

const nextId = (state: RuntimeGameState, prefix: string): string => {
  state.sequence += 1;
  return `${prefix}-${state.sequence}`;
};

const expandWave = (wave: WaveDefinition): SpawnInstruction[] => {
  const instructions: SpawnInstruction[] = [];
  wave.entries.forEach((entry) => {
    for (let index = 0; index < entry.count; index += 1) {
      instructions.push({
        type: entry.type,
        delay: entry.spacing,
      });
    }
  });
  return instructions;
};

const getPointAtDistance = (distance: number): Point => {
  const clampedDistance = Math.max(0, Math.min(distance, TOTAL_PATH_LENGTH));
  let travelled = 0;

  for (const segment of PATH_SEGMENTS) {
    if (clampedDistance <= travelled + segment.length) {
      const progress =
        segment.length === 0
          ? 0
          : (clampedDistance - travelled) / segment.length;

      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * progress,
        y: segment.start.y + (segment.end.y - segment.start.y) * progress,
      };
    }

    travelled += segment.length;
  }

  return clonePoint(PATH_POINTS[PATH_POINTS.length - 1]);
};

const recordEvent = (
  state: RuntimeGameState,
  emittedEvents: GameEvent[],
  type: GameEventType,
  message: string,
): GameEvent => {
  const event: GameEvent = {
    id: nextId(state, 'event'),
    type,
    message,
    createdAt: Date.now(),
  };

  state.eventFeed = [event, ...state.eventFeed].slice(0, MAX_EVENT_FEED);
  emittedEvents.push(event);
  return event;
};

export const recordSystemEvent = (
  state: RuntimeGameState,
  type: GameEventType,
  message: string,
): GameEvent => {
  const emittedEvents: GameEvent[] = [];
  return recordEvent(state, emittedEvents, type, message);
};

export const createRuntimeState = (
  mode: GameMode,
  roomId: string | null,
  players: PlayerPresence[],
): RuntimeGameState => ({
  roomId,
  mode,
  status: 'lobby',
  coreHealth: CORE_MAX_HEALTH,
  resources: STARTING_RESOURCES,
  waveNumber: 0,
  currentWaveLabel: 'Prepare your defenses',
  activeWave: false,
  nextWaveIn: 0,
  towers: [],
  enemies: [],
  buildPads: cloneBuildPads(),
  players: players.map((player) => ({ ...player })),
  beams: [],
  eventFeed: [],
  pendingSpawns: [],
  spawnCooldown: 0,
  passiveIncomeCooldown: PASSIVE_INCOME_INTERVAL,
  clock: 0,
  sequence: 0,
});

export const setPlayers = (
  state: RuntimeGameState,
  players: PlayerPresence[],
): void => {
  state.players = players.map((player) => ({ ...player }));
};

export const canStartWave = (state: RuntimeGameState): boolean =>
  !state.activeWave &&
  state.status !== 'won' &&
  state.status !== 'lost' &&
  state.waveNumber < WAVE_DEFINITIONS.length;

export const createSnapshot = (state: RuntimeGameState): GameSnapshot => ({
  roomId: state.roomId,
  mode: state.mode,
  status: state.status,
  clock: state.clock,
  coreHealth: state.coreHealth,
  coreMaxHealth: CORE_MAX_HEALTH,
  resources: state.resources,
  waveNumber: state.waveNumber,
  totalWaves: WAVE_DEFINITIONS.length,
  currentWaveLabel: state.currentWaveLabel,
  activeWave: state.activeWave,
  canStartWave: canStartWave(state),
  nextWaveIn: state.nextWaveIn,
  towers: state.towers.map((tower) => ({
    ...tower,
    position: clonePoint(tower.position),
  })),
  enemies: state.enemies.map((enemy) => ({
    ...enemy,
    position: clonePoint(enemy.position),
  })),
  buildPads: state.buildPads.map((pad) => ({
    ...pad,
    position: clonePoint(pad.position),
  })),
  players: state.players.map((player) => ({ ...player })),
  beams: state.beams.map((beam) => ({
    ...beam,
    from: clonePoint(beam.from),
    to: clonePoint(beam.to),
  })),
  eventFeed: state.eventFeed.map((event) => ({ ...event })),
});

const getDamageModifier = (towerType: TowerType, enemyType: EnemyType): number => {
  const enemyDefinition = ENEMY_DEFINITIONS[enemyType];

  if (towerType === 'health-insurance' && enemyDefinition.medical) {
    return 2;
  }

  if (towerType === 'term-life' && enemyDefinition.boss) {
    return 2.4;
  }

  if (towerType === 'savings' && enemyDefinition.boss) {
    return 0.7;
  }

  return 1;
};

const selectTargetEnemy = (
  enemies: EnemyState[],
  ignoredEnemyIds: Set<string>,
  towerPosition: Point,
  range: number,
): EnemyState | null => {
  let selectedEnemy: EnemyState | null = null;

  for (const enemy of enemies) {
    if (ignoredEnemyIds.has(enemy.id)) {
      continue;
    }

    const inRange =
      Math.hypot(
        enemy.position.x - towerPosition.x,
        enemy.position.y - towerPosition.y,
      ) <= range;

    if (!inRange) {
      continue;
    }

    if (!selectedEnemy) {
      selectedEnemy = enemy;
      continue;
    }

    const currentDefinition = ENEMY_DEFINITIONS[selectedEnemy.type];
    const nextDefinition = ENEMY_DEFINITIONS[enemy.type];

    if (nextDefinition.boss && !currentDefinition.boss) {
      selectedEnemy = enemy;
      continue;
    }

    if (enemy.distance > selectedEnemy.distance) {
      selectedEnemy = enemy;
    }
  }

  return selectedEnemy;
};

const createEnemyState = (
  state: RuntimeGameState,
  type: EnemyType,
): EnemyState => {
  const definition = ENEMY_DEFINITIONS[type];

  return {
    id: nextId(state, 'enemy'),
    type,
    position: clonePoint(PATH_POINTS[0]),
    distance: 0,
    health: definition.maxHealth,
    maxHealth: definition.maxHealth,
    speed: definition.speed,
    reward: definition.reward,
    radius: definition.radius,
    coreDamage: definition.coreDamage,
    disruptCooldownRemaining: definition.disruptsTowers ? 1.3 : 0,
  };
};

export const attemptPlaceTower = (
  state: RuntimeGameState,
  padId: string,
  towerType: TowerType,
  actorName: string,
): { accepted: boolean; reason?: string; event?: GameEvent } => {
  if (state.status === 'won' || state.status === 'lost') {
    return { accepted: false, reason: 'The run is over.' };
  }

  const pad = state.buildPads.find((candidate) => candidate.id === padId);
  if (!pad) {
    return { accepted: false, reason: 'That build pad does not exist.' };
  }

  if (pad.occupiedTowerId) {
    return { accepted: false, reason: 'That pad is already occupied.' };
  }

  const definition = TOWER_DEFINITIONS[towerType];
  if (state.resources < definition.cost) {
    return { accepted: false, reason: 'Not enough shared resources.' };
  }

  const towerId = nextId(state, 'tower');
  const tower: TowerState = {
    id: towerId,
    type: towerType,
    padId,
    position: clonePoint(pad.position),
    cooldownRemaining: 0,
    incomeCooldownRemaining: definition.incomeInterval ?? 0,
    disabledUntil: 0,
    ownerId: actorName,
  };

  const emittedEvents: GameEvent[] = [];
  state.resources -= definition.cost;
  state.towers.push(tower);
  pad.occupiedTowerId = towerId;
  const event = recordEvent(
    state,
    emittedEvents,
    'PLACE_TOWER',
    `${actorName} deployed ${definition.name}.`,
  );

  return { accepted: true, event };
};

export const startNextWave = (
  state: RuntimeGameState,
  actorName: string,
): { accepted: boolean; reason?: string; event?: GameEvent } => {
  if (!canStartWave(state)) {
    return { accepted: false, reason: 'A wave is already running.' };
  }

  const wave = WAVE_DEFINITIONS[state.waveNumber];
  const emittedEvents: GameEvent[] = [];

  state.waveNumber += 1;
  state.currentWaveLabel = wave.label;
  state.activeWave = true;
  state.status = 'running';
  state.pendingSpawns = expandWave(wave);
  state.spawnCooldown = 0;
  state.nextWaveIn = 0;

  const event = recordEvent(
    state,
    emittedEvents,
    'START_WAVE',
    `${actorName} started Wave ${wave.id}: ${wave.label}.`,
  );

  return { accepted: true, event };
};

export const stepRuntimeState = (
  state: RuntimeGameState,
  dt: number,
): GameEvent[] => {
  const emittedEvents: GameEvent[] = [];
  const reservedEnemyIds = new Set<string>();

  if (state.status === 'won' || state.status === 'lost') {
    return emittedEvents;
  }

  state.clock += dt;
  state.beams = state.beams
    .map((beam) => ({ ...beam, ttl: beam.ttl - dt }))
    .filter((beam) => beam.ttl > 0);

  if (!state.activeWave && state.status === 'running' && state.nextWaveIn > 0) {
    state.nextWaveIn = Math.max(0, state.nextWaveIn - dt);
    if (state.nextWaveIn <= 0 && state.waveNumber < WAVE_DEFINITIONS.length) {
      const autoStart = startNextWave(state, 'Auto coordinator');
      if (autoStart.event) {
        emittedEvents.push(autoStart.event);
      }
    }
  }

  state.passiveIncomeCooldown -= dt;
  while (state.passiveIncomeCooldown <= 0) {
    state.passiveIncomeCooldown += PASSIVE_INCOME_INTERVAL;
    state.resources += PASSIVE_INCOME_AMOUNT;
  }

  if (state.activeWave) {
    state.spawnCooldown -= dt;

    while (state.pendingSpawns.length > 0 && state.spawnCooldown <= 0) {
      const nextSpawn = state.pendingSpawns.shift();
      if (!nextSpawn) {
        break;
      }

      state.enemies.push(createEnemyState(state, nextSpawn.type));
      recordEvent(
        state,
        emittedEvents,
        'ENEMY_SPAWN',
        `${ENEMY_DEFINITIONS[nextSpawn.type].name} entered the field.`,
      );

      state.spawnCooldown += nextSpawn.delay;
    }
  }

  const coreBreaches: EnemyState[] = [];

  for (const enemy of state.enemies) {
    enemy.distance += enemy.speed * dt;
    enemy.position = getPointAtDistance(enemy.distance);
    enemy.disruptCooldownRemaining = Math.max(
      0,
      enemy.disruptCooldownRemaining - dt,
    );

    if (
      enemy.type === 'inflation-cloud' &&
      enemy.disruptCooldownRemaining === 0 &&
      state.towers.length > 0
    ) {
      const towerToDisable = state.towers.find((tower) => {
        const distanceToTower = Math.hypot(
          tower.position.x - enemy.position.x,
          tower.position.y - enemy.position.y,
        );

        return distanceToTower <= 92;
      });

      if (towerToDisable) {
        towerToDisable.disabledUntil =
          Math.max(towerToDisable.disabledUntil, state.clock) + 1.6;
        enemy.disruptCooldownRemaining = 3.4;

        recordEvent(
          state,
          emittedEvents,
          'TOWER_DISABLED',
          `${TOWER_DEFINITIONS[towerToDisable.type].name} was stressed by Inflation Cloud.`,
        );
      }
    }

    if (enemy.distance >= TOTAL_PATH_LENGTH) {
      coreBreaches.push(enemy);
    }
  }

  if (coreBreaches.length > 0) {
    const breachedIds = new Set(coreBreaches.map((enemy) => enemy.id));
    state.enemies = state.enemies.filter((enemy) => !breachedIds.has(enemy.id));

    for (const enemy of coreBreaches) {
      state.coreHealth = Math.max(0, state.coreHealth - enemy.coreDamage);
      recordEvent(
        state,
        emittedEvents,
        'CORE_DAMAGE',
        `${ENEMY_DEFINITIONS[enemy.type].name} hit the Family Protection Core for ${enemy.coreDamage}.`,
      );
    }
  }

  if (state.coreHealth <= 0) {
    state.status = 'lost';
    state.activeWave = false;
    state.pendingSpawns = [];

    recordEvent(
      state,
      emittedEvents,
      'GAME_OVER',
      'The Family Protection Core was overwhelmed.',
    );

    return emittedEvents;
  }

  for (const tower of state.towers) {
    tower.cooldownRemaining = Math.max(0, tower.cooldownRemaining - dt);
    tower.incomeCooldownRemaining = Math.max(
      0,
      tower.incomeCooldownRemaining - dt,
    );

    const definition = TOWER_DEFINITIONS[tower.type];

    if (tower.type === 'investment') {
      while (tower.incomeCooldownRemaining <= 0) {
        tower.incomeCooldownRemaining += definition.incomeInterval ?? 4;
        state.resources += definition.incomeAmount ?? 0;
        recordEvent(
          state,
          emittedEvents,
          'RESOURCE_GAIN',
          `${definition.name} generated ${definition.incomeAmount ?? 0} resources.`,
        );
      }

      continue;
    }

    if (tower.cooldownRemaining > 0 || state.clock < tower.disabledUntil) {
      continue;
    }

    const targetEnemy = selectTargetEnemy(
      state.enemies,
      reservedEnemyIds,
      tower.position,
      definition.range,
    );

    if (!targetEnemy) {
      continue;
    }

    const damage = Math.round(
      definition.damage * getDamageModifier(tower.type, targetEnemy.type),
    );
    targetEnemy.health = Math.max(0, targetEnemy.health - damage);
    tower.cooldownRemaining = definition.cooldown;
    if (targetEnemy.health <= 0) {
      reservedEnemyIds.add(targetEnemy.id);
    }

    state.beams = [
      ...state.beams.slice(-11),
      {
        id: nextId(state, 'beam'),
        from: clonePoint(tower.position),
        to: clonePoint(targetEnemy.position),
        color: definition.color,
        ttl: 0.12,
      },
    ];
  }

  const defeatedEnemies = state.enemies.filter((enemy) => enemy.health <= 0);

  if (defeatedEnemies.length > 0) {
    const defeatedIds = new Set(defeatedEnemies.map((enemy) => enemy.id));
    state.enemies = state.enemies.filter((enemy) => !defeatedIds.has(enemy.id));

    for (const enemy of defeatedEnemies) {
      state.resources += enemy.reward;
      recordEvent(
        state,
        emittedEvents,
        'ENEMY_DEFEATED',
        `${ENEMY_DEFINITIONS[enemy.type].name} was neutralized for ${enemy.reward} resources.`,
      );
    }
  }

  if (
    state.activeWave &&
    state.pendingSpawns.length === 0 &&
    state.enemies.length === 0
  ) {
    state.activeWave = false;

    if (state.waveNumber >= WAVE_DEFINITIONS.length) {
      state.status = 'won';
      recordEvent(
        state,
        emittedEvents,
        'GAME_OVER',
        'All threats were contained. Legacy Defenders wins.',
      );
      return emittedEvents;
    }

    const completedWave = WAVE_DEFINITIONS[state.waveNumber - 1];
    state.resources += completedWave.bounty;
    state.nextWaveIn = INTERMISSION_SECONDS;
    state.currentWaveLabel = `Wave ${state.waveNumber + 1} incoming`;

    recordEvent(
      state,
      emittedEvents,
      'WAVE_CLEARED',
      `Wave ${completedWave.id} cleared. Bonus payout: ${completedWave.bounty}.`,
    );
  }

  return emittedEvents;
};
