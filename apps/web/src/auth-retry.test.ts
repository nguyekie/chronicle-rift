import {describe,expect,it} from 'vitest';
import {shouldRefreshAuth} from './auth-retry';

describe('shouldRefreshAuth',()=>{
 it('refreshes an expired access token',()=>expect(shouldRefreshAuth(401,true,true)).toBe(true));
 it('refreshes once when a changed role makes the old token forbidden',()=>expect(shouldRefreshAuth(403,true,true)).toBe(true));
 it('does not loop or refresh without a refresh token',()=>{
  expect(shouldRefreshAuth(403,false,true)).toBe(false);
  expect(shouldRefreshAuth(403,true,false)).toBe(false);
 });
 it('does not refresh unrelated server errors',()=>expect(shouldRefreshAuth(500,true,true)).toBe(false));
});
