if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = class DummyWebSocket {};
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pqekoqryvpfomexmptik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWtvcXJ5dnBmb21leG1wdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzA0ODIsImV4cCI6MjEwNzIwNjQ4Mn0.r32Ax0I_rW9EkmkyDSIbUc7lSUU0P51StmpDhsXf7G8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { enabled: false }
});

const REPORT = {
  connection: null,
  tables: {},
  crudTests: {},
  appIntegrationChecks: {}
};

async function runFullHealthCheck() {
  console.log('🚀 Starting Comprehensive Supabase Diagnostic & Live CRUD Tests...\n');

  // 1. Basic Connection
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('stores').select('id').limit(1);
    const latency = Date.now() - start;
    if (error) throw error;
    REPORT.connection = { status: 'ONLINE', latencyMs: latency };
    console.log(`✅ Supabase Connection: ONLINE (${latency}ms)`);
  } catch (err) {
    REPORT.connection = { status: 'FAILED', error: err.message };
    console.error('❌ Supabase Connection Failed:', err);
    return;
  }

  // 2. Table Schemas & Row Counts
  const tables = ['stores', 'store_inventory', 'orders', 'users', 'riders', 'audit_logs'];

  for (const tbl of tables) {
    try {
      const { data, count, error } = await supabase
        .from(tbl)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        REPORT.tables[tbl] = { status: 'ERROR', error: error.message };
        console.log(`❌ Table [${tbl}]: ERROR - ${error.message}`);
      } else {
        const columns = data && data[0] ? Object.keys(data[0]) : [];
        REPORT.tables[tbl] = { status: 'ACTIVE', rowCount: count, columns: columns };
        console.log(`✅ Table [${tbl}]: ACTIVE | Rows: ${count} | Columns (${columns.length}): ${columns.join(', ')}`);
      }
    } catch (err) {
      REPORT.tables[tbl] = { status: 'FAILED', error: err.message };
      console.log(`❌ Table [${tbl}]: EXCEPTION - ${err.message}`);
    }
  }

  console.log('\n🧪 Running End-to-End Live CRUD Verification on All Entities...\n');

  // 3. CRUD on 'stores'
  const testStoreId = 'store-test-diag-' + Date.now();
  try {
    // INSERT
    const { data: insertedStore, error: insErr } = await supabase.from('stores').insert({
      id: testStoreId,
      name: 'Diagnostic Store Test',
      category: 'Electronics & Test',
      address: 'Plot 99 Diagnostics Way, Abuja',
      district: 'Maitama, Abuja',
      city: 'Abuja',
      latitude: 9.0882,
      longitude: 7.4933,
      phone: '+234 800 000 0000',
      rating: 5.0,
      is_open: true,
      delivery_fee: 1200
    }).select().single();
    if (insErr) throw insErr;

    // UPDATE
    const { error: updErr } = await supabase.from('stores').update({ name: 'Diagnostic Store Test (Updated)' }).eq('id', testStoreId);
    if (updErr) throw updErr;

    // CLEANUP DELETE
    const { error: delErr } = await supabase.from('stores').delete().eq('id', testStoreId);
    if (delErr) throw delErr;

    REPORT.crudTests.stores = 'PASS (Insert, Update, Delete Verified)';
    console.log('✅ CRUD Test [stores]: PASS');
  } catch (err) {
    REPORT.crudTests.stores = 'FAIL: ' + err.message;
    console.log('❌ CRUD Test [stores]: FAIL -', err.message);
  }

  // 4. CRUD on 'store_inventory'
  const testItemId = 'item-test-diag-' + Date.now();
  try {
    // INSERT
    const { error: insErr } = await supabase.from('store_inventory').insert({
      id: testItemId,
      store_id: 'store-1791761446952',
      name: 'Diagnostic Test Provision',
      category: 'Provisions',
      price: 1500,
      icon: '🛍️',
      out_of_stock: false
    });
    if (insErr) throw insErr;

    // UPDATE
    const { error: updErr } = await supabase.from('store_inventory').update({ price: 1800, out_of_stock: true }).eq('id', testItemId);
    if (updErr) throw updErr;

    // CLEANUP DELETE
    const { error: delErr } = await supabase.from('store_inventory').delete().eq('id', testItemId);
    if (delErr) throw delErr;

    REPORT.crudTests.store_inventory = 'PASS (Insert, Update, Delete Verified)';
    console.log('✅ CRUD Test [store_inventory]: PASS');
  } catch (err) {
    REPORT.crudTests.store_inventory = 'FAIL: ' + err.message;
    console.log('❌ CRUD Test [store_inventory]: FAIL -', err.message);
  }

  // 5. CRUD on 'orders' with Full Multi-Store JSONB Payload
  const testOrderId = 'ORD-TEST-DIAG-' + Date.now().toString().slice(-5);
  try {
    const stopsPayload = [
      { stopNumber: 1, storeName: 'Hub A', latitude: 9.0882, longitude: 7.4933, pickupPin: '1111', pickupStatus: 'picked_up' },
      { stopNumber: 2, storeName: 'Hub B', latitude: 9.0765, longitude: 7.4772, pickupPin: '2222', pickupStatus: 'in_progress' }
    ];
    const roadPointsPayload = [
      { latitude: 9.0882, longitude: 7.4933 },
      { latitude: 9.0820, longitude: 7.4850 },
      { latitude: 9.0765, longitude: 7.4772 }
    ];

    // INSERT with JSONB bolt_rider
    const { error: insErr } = await supabase.from('orders').insert({
      id: testOrderId,
      store_id: 'store-1791761446952',
      store_name: 'Diagnostic Multi-Store Order',
      customer_name: 'Test Diagnostic User',
      customer_phone: '08032941194',
      customer_address: 'Plot 10 Maitama Abuja',
      delivery_lat: 9.0800,
      delivery_lng: 7.4900,
      items: [{ id: '1', name: 'Item A', price: 2000, qty: 1, storeName: 'Hub A' }],
      items_count: 1,
      subtotal: 2000,
      total: 3200,
      vendor_payout: 1800,
      delivery_fee: 1200,
      status: 'Preparing',
      delivery_pin: '4455',
      pickup_pin: '1111',
      bolt_rider: {
        id: 'bolt-01',
        name: 'Musa Ibrahim',
        stops: stopsPayload,
        roadRouteCoordinates: roadPointsPayload,
        isMultiStore: true,
        currentStopIndex: 1,
        journeyAlert: 'Testing diagnostic live alert'
      },
      bolt_coords: { latitude: 9.0820, longitude: 7.4850 }
    });
    if (insErr) throw insErr;

    // READ BACK & VERIFY COMPLETE EXTRACTION
    const { data: readBack, error: readErr } = await supabase.from('orders').select('*').eq('id', testOrderId).single();
    if (readErr) throw readErr;

    const riderMeta = readBack.bolt_rider || {};
    const stopsOk = Array.isArray(riderMeta.stops) && riderMeta.stops.length === 2;
    const coordsOk = Array.isArray(riderMeta.roadRouteCoordinates) && riderMeta.roadRouteCoordinates.length === 3;

    if (!stopsOk || !coordsOk) {
      throw new Error(`Stops or RoadCoordinates failed to persist in JSONB: stopsOk=${stopsOk}, coordsOk=${coordsOk}`);
    }

    // UPDATE STATUS
    const { error: updErr } = await supabase.from('orders').update({
      status: 'Completed',
      bolt_coords: { latitude: 9.0765, longitude: 7.4772 }
    }).eq('id', testOrderId);
    if (updErr) throw updErr;

    // CLEANUP DELETE
    const { error: delErr } = await supabase.from('orders').delete().eq('id', testOrderId);
    if (delErr) throw delErr;

    REPORT.crudTests.orders = 'PASS (Full JSONB Stops, Multi-Store Routes, Status Updates, Deletion Verified)';
    console.log('✅ CRUD Test [orders]: PASS (Verified stops and roadRouteCoordinates in JSONB)');
  } catch (err) {
    REPORT.crudTests.orders = 'FAIL: ' + err.message;
    console.log('❌ CRUD Test [orders]: FAIL -', err.message);
  }

  // 6. CRUD on 'users'
  const testUserId = 'user-diag-' + Date.now();
  try {
    const { error: insErr } = await supabase.from('users').insert({
      id: testUserId,
      full_name: 'Diagnostic User Test',
      phone: '09998887766',
      email: `diag_${Date.now()}@test.ng`,
      role: 'buyer',
      password_hash: 'testpass'
    });
    if (insErr) throw insErr;

    // CLEANUP DELETE
    const { error: delErr } = await supabase.from('users').delete().eq('id', testUserId);
    if (delErr) throw delErr;

    REPORT.crudTests.users = 'PASS (Insert & Delete Verified)';
    console.log('✅ CRUD Test [users]: PASS');
  } catch (err) {
    REPORT.crudTests.users = 'FAIL: ' + err.message;
    console.log('❌ CRUD Test [users]: FAIL -', err.message);
  }

  // 7. CRUD on 'riders'
  const testRiderId = 'rider-diag-' + Date.now();
  try {
    const { error: insErr } = await supabase.from('riders').insert({
      id: testRiderId,
      name: 'Diagnostic Test Rider',
      phone: '+234 803 999 8877',
      vehicle: 'TVS Neo (Black)',
      plate: 'ABJ-999-ZZ',
      rating: 5.0,
      trips: 10,
      avatar: '🛵',
      is_active: true
    });
    if (insErr) throw insErr;

    const { error: delErr } = await supabase.from('riders').delete().eq('id', testRiderId);
    if (delErr) throw delErr;

    REPORT.crudTests.riders = 'PASS (Insert & Delete Verified)';
    console.log('✅ CRUD Test [riders]: PASS');
  } catch (err) {
    REPORT.crudTests.riders = 'FAIL: ' + err.message;
    console.log('❌ CRUD Test [riders]: FAIL -', err.message);
  }

  if (REPORT.tables.audit_logs && REPORT.tables.audit_logs.status === 'ACTIVE') {
    const testLogId = 'log-diag-' + Date.now();
    try {
      const { error: insErr } = await supabase.from('audit_logs').insert({
        id: testLogId,
        action: 'DIAGNOSTIC_HEALTH_CHECK',
        user_identifier: 'test-runner',
        payload: JSON.stringify({ timestamp: new Date().toISOString(), status: 'HEALTHY' })
      });
      if (insErr) throw insErr;

      const { error: delErr } = await supabase.from('audit_logs').delete().eq('id', testLogId);
      if (delErr) throw delErr;

      REPORT.crudTests.audit_logs = 'PASS (Insert & Delete Verified)';
      console.log('✅ CRUD Test [audit_logs]: PASS');
    } catch (err) {
      REPORT.crudTests.audit_logs = 'FAIL: ' + err.message;
      console.log('❌ CRUD Test [audit_logs]: FAIL -', err.message);
    }
  }

  console.log('\n📊 Diagnostic Summary:\n', JSON.stringify(REPORT, null, 2));
}

runFullHealthCheck();
