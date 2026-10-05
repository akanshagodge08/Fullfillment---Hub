import assert from 'node:assert/strict';
import {seed,applyAction} from '../lib/fulfillment.ts';
let s=seed();const id=s.orders[0].id;const original=structuredClone(s);
s=applyAction(s,{type:'advance',id,courier:'Blue Dart'});
assert.equal(s.orders[0].status,'Picking');assert.equal(original.orders[0].status,'Received');
assert.throws(()=>applyAction(s,{type:'advance',id,sku:'WRONG',qty:2}),/SKU/);
const before=s.products[0].main;s=applyAction(s,{type:'advance',id,sku:s.orders[0].sku,qty:2});assert.equal(s.products[0].main,before-2);
assert.throws(()=>applyAction(s,{type:'advance',id,verified:true,location:''}),/rack/);
s=applyAction(s,{type:'advance',id,verified:true,location:'RACK-4'});assert.equal(s.orders[0].status,'Ready for pickup');
assert.throws(()=>applyAction(s,{type:'advance',id,collected:false}),/collected/);
s=applyAction(s,{type:'advance',id,collected:true});assert.equal(s.orders[0].status,'Shipped');
assert.throws(()=>applyAction(s,{type:'advance',id,collected:true}),/cannot advance/);
assert.throws(()=>applyAction(s,{type:'advance',id:'XYZ-1043',verified:true,location:'RACK-1'}),/issues/);
s=applyAction(s,{type:'resolve',issue:'ISS-101',note:'Located stock and verified the product'});assert.equal(s.issues[0].resolved,true);
const p=s.products[2];const total=p.main+p.overflow;s=applyAction(s,{type:'transfer',sku:p.sku,qty:5});assert.equal(s.products[2].main,5);assert.equal(s.products[2].main+s.products[2].overflow,total);
assert.throws(()=>applyAction(s,{type:'transfer',sku:p.sku,qty:-1}),/valid quantity/);
assert.throws(()=>applyAction(s,{type:'transfer',sku:p.sku,qty:999}),/valid quantity/);
assert.throws(()=>applyAction(s,{type:'transfer',sku:p.sku,qty:1.5}),/valid quantity/);
console.log('PASS: lifecycle, incorrect SKU, stock deduction, packing gate, collection gate, issue block/resolution and stock transfer validation.');


