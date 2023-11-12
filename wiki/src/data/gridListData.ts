/* eslint-disable @typescript-eslint/no-explicit-any */
import go from "@site/static/img/skills-icon/go.png";

import html from "@site/static/img/skills-icon/html.png";
import css from "@site/static/img/skills-icon/css.png";
import javascript from "@site/static/img/skills-icon/javascript.png";
import typescript from "@site/static/img/skills-icon/typescript.png";
import rust from "@site/static/img/skills-icon/rust.png";
import dart from "@site/static/img/skills-icon/dart.png";
import sql from "@site/static/img/skills-icon/sql.png";
import lua from "@site/static/img/skills-icon/lua.png";
import solidity from "@site/static/img/skills-icon/solidity.png";
import nodejs from "@site/static/img/skills-icon/nodejs.png";
import cpp from "@site/static/img/skills-icon/cpp.png";
import java from "@site/static/img/skills-icon/java.png";
import php from "@site/static/img/skills-icon/php.png";
import python from "@site/static/img/skills-icon/python.png";
import bitcoin from "@site/static/img/skills-icon/bitcoin.png";
import ethereum from "@site/static/img/skills-icon/ethereum.png";
import defi from "@site/static/img/skills-icon/defi.png";
import mysql from "@site/static/img/skills-icon/mysql.png";
import redis from "@site/static/img/skills-icon/redis.png";
import mongodb from "@site/static/img/skills-icon/mongodb.png";
import clickhouse from "@site/static/img/skills-icon/clickhouse.png";
import docker from "@site/static/img/skills-icon/docker.png";
import kubernetes from "@site/static/img/skills-icon/kubernetes.png";
import aws from "@site/static/img/skills-icon/aws.png";
import cicd from "@site/static/img/skills-icon/cicd.png";
import linux from "@site/static/img/skills-icon/linux.png";
import web from "@site/static/img/skills-icon/web.png";
import android from "@site/static/img/skills-icon/android.png";
import bin from "@site/static/img/skills-icon/bin.png";
import react from "@site/static/img/skills-icon/react.png";
import vue from "@site/static/img/skills-icon/vue.png";
import flutter from "@site/static/img/skills-icon/flutter.png";
import laravel from "@site/static/img/skills-icon/laravel.png";
import flink from "@site/static/img/skills-icon/flink.png";
import latex from "@site/static/img/skills-icon/latex.png";

import {
  languagesMenuData as languagesData,
  blockchainMenuData as blockchainData,
  othersMenuData as othersData,
  databaseMenuData as databaseData,
  devopsMenuData as devOpsData,
  securityMenuData as securityData,
  frameworkMenuData as frameworkData,
} from "./index";

export interface GridItemType {
  readonly title: string;
  readonly link: string;
  readonly src: any;
  readonly fontSize: FontSize;
}

type FontSize = "sm" | "md" | "lg";

function gridItem(
  title: string,
  link: string,
  src: any,
  fontSize: FontSize = "lg"
): GridItemType {
  return {
    title: title,
    link: link,
    src: src,
    fontSize: fontSize,
  };
}

const languagesGridList: Array<GridItemType> = [
  gridItem(languagesData.go, "/docs/go", go),
  gridItem(languagesData.cpp, "/docs/cpp", cpp),
  gridItem(languagesData.java, "/docs/java", java),
  gridItem(languagesData.php, "/docs/php", php),
  gridItem(languagesData.python, "/docs/python", python),

  gridItem(languagesData.rust, "/docs/rust", rust),
  gridItem(languagesData.html, "/docs/html", html),
  gridItem(languagesData.css, "/docs/css", css),
  gridItem(languagesData.javascript, "/docs/javascript", javascript),
  gridItem(languagesData.typescript, "/docs/typescript", typescript),
  // gridItem(languagesData.markdown, "/docs/markdown", markdown),
  gridItem(languagesData.dart, "/docs/dart", dart),
  gridItem(languagesData.sql, "/docs/sql", sql),
  gridItem(languagesData.lua, "/docs/lua", lua),
  gridItem(languagesData.solidity, "/docs/solidity", solidity),
  gridItem(languagesData.nodejs, "/docs/nodejs", nodejs),
];

const blockchainGridList: Array<GridItemType> = [
  gridItem(blockchainData.bitcoin, "/docs/bitcoin", bitcoin),
  gridItem(blockchainData.ethereum, "/docs/ethereum", ethereum),
  gridItem(blockchainData.defi, "/docs/defi", defi),
];

const databaseGridList: Array<GridItemType> = [
  gridItem(databaseData.mysql, "/docs/mysql", mysql),
  gridItem(databaseData.redis, "/docs/redis", redis),
  gridItem(databaseData.mongodb, "/docs/mongodb", mongodb),
  gridItem(databaseData.clickhouse, "/docs/clickhouse", clickhouse),
];

const devOpsGridList: Array<GridItemType> = [
  gridItem(devOpsData.docker, "/docs/docker", docker),
  gridItem(devOpsData.kubernetes, "/docs/kubernetes", kubernetes),
  gridItem(devOpsData.aws, "/docs/aws", aws),
  gridItem(devOpsData.cicd, "/docs/cicd", cicd),
  gridItem(devOpsData.linux, "/docs/linux", linux),
];

const securityGridList: Array<GridItemType> = [
  gridItem(securityData.web, "/docs/web", web),
  gridItem(securityData.android, "/docs/android", android),
  gridItem(securityData.bin, "/docs/bin", bin),
];

const frameworkGridList: Array<GridItemType> = [
  gridItem(frameworkData.react, "/docs/react", react),
  gridItem(frameworkData.vue, "/docs/vue", vue),
  gridItem(frameworkData.flutter, "/docs/flutter", flutter),
  gridItem(frameworkData.laravel, "/docs/laravel", laravel),
  gridItem(frameworkData.android, "/docs/android", android),
];

const othersGridList: Array<GridItemType> = [
  gridItem(othersData.flink, "/docs/flink", flink),
  gridItem(othersData.latex, "/docs/latex", latex),
];

export { languagesGridList, blockchainGridList, othersGridList, databaseGridList, devOpsGridList, securityGridList, frameworkGridList };
