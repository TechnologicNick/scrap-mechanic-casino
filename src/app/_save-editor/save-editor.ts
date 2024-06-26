import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import SqlJsPackageJson from "sql.js/package.json";
import Container, { IContainer } from "./structures/container";
import type { IGenericData } from "./structures/generic-data";
import Player from "./structures/player";
import Uuid from "./structures/uuid";
import GameMode from "./types/game-mode";

export let SQL: SqlJsStatic;

const sqlJsVersion = SqlJsPackageJson.version;

export const initSql = async () => {
  return SQL ??= await initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${sqlJsVersion}/${file}`
  });
}

const parameters = (count: number) => "?, ".repeat(count).replace(/, $/, "");

const toUInt32LE = (number: number) => {
  let buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(number);
  return buffer;
}

export default class SaveEditor {

  uuid: Uuid;
  file: File;
  db!: Database;

  constructor(file: File) {
    this.uuid = Uuid.randomUuid();
    this.file = file;
  }

  async loadDatabase() {
    await initSql();

    return this.db = new SQL.Database(new Uint8Array(await this.file.arrayBuffer()));
  }

  getVersion() {
    return this.db.exec("SELECT savegameversion FROM Game")[0].values[0][0] as number;
  }

  getAllPlayers() {
    return this.db.exec("SELECT data FROM GenericData WHERE worldId = 65534 AND flags = 3 ORDER BY key ASC")
      .flatMap(result => result.values.map(value => Player.deserialize(Buffer.from(value[0] as Uint8Array))));
  }

  deletePlayers(players: Player[]) {
    this.db.exec(`DELETE FROM GenericData WHERE worldId = 65534 AND flags = 3 AND key IN (${parameters(players.length)})`,
      players.map(player => toUInt32LE(player.key))
    );

    return this.db.getRowsModified();
  }

  deleteAllPlayers() {
    this.db.exec("DELETE FROM GenericData WHERE worldId = 65534 AND flags = 3");

    return this.db.getRowsModified();
  }

  updatePlayer(oldGenericData: IGenericData, newPlayer: Player) {
    this.db.exec(
      "UPDATE GenericData SET " +
      "uid = $newUid, " +
      "key = $newKey, " +
      "worldId = $newWorldId, " +
      "flags = $newFlags, " +
      "data = $newData " +
      "WHERE " +
      "uid = $oldUid AND " +
      "key = $oldKey AND " +
      "worldId = $oldWorldId AND " +
      "flags = $oldFlags",
      {
        $newUid: newPlayer.uid.blob,
        $newKey: toUInt32LE(newPlayer.key),
        $newWorldId: newPlayer.worldId,
        $newFlags: newPlayer.flags,
        $newData: newPlayer.serialize(),

        $oldUid: oldGenericData.uid.blob,
        $oldKey: toUInt32LE(oldGenericData.key),
        $oldWorldId: oldGenericData.worldId,
        $oldFlags: oldGenericData.flags,
      }
    );

    const modified = this.db.getRowsModified();

    if (modified === 0) {
      throw new Error(`Failed to find oldGenericData ${JSON.stringify(oldGenericData)}`);
    }

    return modified;
  }

  getGameMode(): GameMode {
    return this.db.exec("SELECT flags FROM Game")[0].values[0][0] as number;
  }

  setGameMode(gameMode: GameMode) {
    this.db.exec("UPDATE Game SET flags = ?", [gameMode]);

    const modified = this.db.getRowsModified();

    if (modified === 0) {
      throw new Error(`Failed to set game mode`);
    }

    return modified;
  }

  getSeed() {
    return this.db.exec("SELECT seed FROM Game")[0].values[0][0] as number;
  }

  setSeed(seed: number) {
    console.log("setting seed", seed);
    this.db.exec("UPDATE Game SET seed = ?", [seed]);

    const modified = this.db.getRowsModified();

    if (modified === 0) {
      throw new Error(`Failed to set seed`);
    }

    return modified;
  }

  getGametick() {
    return this.db.exec("SELECT gametick FROM Game")[0].values[0][0] as number;
  }

  setGametick(gametick: number) {
    this.db.exec("UPDATE Game SET gametick = ?", [gametick]);

    const modified = this.db.getRowsModified();

    if (modified === 0) {
      throw new Error(`Failed to set gametick`);
    }

    return modified;
  }

  getAllContainers() {
    return this.db.exec("SELECT data FROM Container ORDER BY id ASC")
      .flatMap(result => result.values.map(value => Container.deserialize(Buffer.from(value[0] as Uint8Array))));
  }

  getContainer(id: number) {
    const blob = (this.db.exec("SELECT data FROM Container WHERE id = ?", [id])[0]?.values[0][0] as Uint8Array | undefined) ?? null;

    if (blob === null) {
      return null;
    }

    return Container.deserialize(Buffer.from(blob));
  }

  updateContainer(container: Container) {
    this.db.exec("UPDATE Container SET data = ? WHERE id = ?", [container.serialize(), container.id]);

    const modified = this.db.getRowsModified();

    if (modified === 0) {
      throw new Error(`Failed to find container ${container.id}`);
    }

    return modified;
  }

  deleteContainers(containerIds: IContainer["id"][]) {
    this.db.exec(`DELETE FROM Container WHERE id IN (${parameters(containerIds.length)})`, containerIds);

    return this.db.getRowsModified();
  }
}
