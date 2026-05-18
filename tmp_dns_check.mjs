import dns from 'dns';
const resolvers = ['resolve4', 'resolve6', 'lookup'];
for (const fn of resolvers) {
  try {
    const res = await dns.promises[fn]('db.qtvnzjuauvqabqofehrd.supabase.co', fn === 'lookup' ? { all: true } : undefined);
    console.log(fn, JSON.stringify(res));
  } catch (e) {
    console.error(fn, e.code || e.message);
  }
}
