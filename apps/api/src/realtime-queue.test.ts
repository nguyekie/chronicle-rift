import {describe,expect,it} from 'vitest';
import {pruneQueue} from './realtime.js';

describe('pruneQueue',()=>{
 it('removes disconnected sockets and duplicate users',()=>{
  const queue=[{userId:'ghost',deckId:'d1',socketId:'gone'},{userId:'live',deckId:'d2',socketId:'s2'},{userId:'live',deckId:'d3',socketId:'s3'}];
  expect(pruneQueue(queue,new Set(['s2','s3']))).toEqual([{userId:'live',deckId:'d2',socketId:'s2'}]);
 });
});
