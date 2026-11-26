/**
 * GETIT 2-Tier Referral Code Generator & Migration Utility
 * - Managers: MG-<STATE>-<###>  (e.g., MG-ABJ-001, MG-LAG-001)
 * - Agents:   AG-<STATE>-<###>  (e.g., AG-ABJ-001, AG-ABJ-002)
 *   (Agent codes intentionally omit the manager's number; linkage is kept internally in Admin/DB.)
 */

const STATE_CODE_MAP = [
  { match: ['abuja', 'fct', 'ng-fct', 'wuse', 'maitama', 'garki', 'gwarinpa', 'asokoro'], code: 'ABJ' },
  { match: ['lagos', 'ng-lag', 'ikeja', 'lekki', 'vi', 'ikoyi', 'surulere'], code: 'LAG' },
  { match: ['rivers', 'port harcourt', 'ng-riv', 'phc'], code: 'PHC' },
  { match: ['kano', 'ng-kan'], code: 'KAN' },
  { match: ['kaduna', 'ng-kad'], code: 'KAD' },
  { match: ['oyo', 'ibadan', 'ng-oyo'], code: 'IBD' },
  { match: ['enugu', 'ng-enu'], code: 'ENU' },
  { match: ['anambra', 'awka', 'onitsha'], code: 'ANA' },
  { match: ['delta', 'asaba', 'warri'], code: 'DEL' },
  { match: ['ogun', 'abeokuta'], code: 'OGN' },
  { match: ['edo', 'benin'], code: 'EDO' },
  { match: ['kwara', 'ilorin'], code: 'KWA' },
  { match: ['plateau', 'jos'], code: 'JOS' },
  { match: ['borno', 'maiduguri'], code: 'BOR' },
  { match: ['katsina'], code: 'KAT' },
  { match: ['abia', 'aba', 'umuahia'], code: 'ABI' },
  { match: ['imo', 'owerri'], code: 'IMO' },
  { match: ['akwa ibom', 'uyo'], code: 'AKW' },
  { match: ['cross river', 'calabar'], code: 'CRS' },
  { match: ['osun', 'osogbo'], code: 'OSU' },
  { match: ['ondo', 'akure'], code: 'OND' },
  { match: ['ekiti', 'ado'], code: 'EKI' },
  { match: ['kogi', 'lokoja'], code: 'KOG' },
  { match: ['niger', 'minna'], code: 'NIG' },
  { match: ['nasarawa', 'lafia'], code: 'NAS' },
  { match: ['benue', 'makurdi'], code: 'BEN' },
  { match: ['bauchi'], code: 'BAU' },
  { match: ['gombe'], code: 'GOM' },
  { match: ['adamawa', 'yola'], code: 'ADA' },
  { match: ['sokoto'], code: 'SOK' },
  { match: ['kebbi'], code: 'KEB' },
  { match: ['zamfara'], code: 'ZAM' },
  { match: ['jigawa'], code: 'JIG' },
  { match: ['yobe'], code: 'YOB' },
  { match: ['taraba', 'jalingo'], code: 'TAR' },
  { match: ['bayelsa', 'yenagoa'], code: 'BAY' },
  { match: ['ebonyi', 'abakaliki'], code: 'EBO' },
];

export function extractStateCode(territoryOrState = '') {
  const raw = String(territoryOrState || '').trim().toLowerCase();
  if (!raw) return 'ABJ';

  for (const entry of STATE_CODE_MAP) {
    if (entry.match.some((kw) => raw.includes(kw))) {
      return entry.code;
    }
  }

  // Fallback: first 3 alpha characters uppercase
  const letters = raw.replace(/[^a-z]/g, '').toUpperCase();
  if (letters.length >= 3) return letters.slice(0, 3);
  return 'ABJ';
}

export function isNewPartnerCodeFormat(code, role) {
  if (!code || typeof code !== 'string') return false;
  const prefix = role === 'MANAGER' ? 'MG' : 'AG';
  return new RegExp(`^${prefix}-[A-Z]{2,4}-\\d{3}$`).test(code.trim().toUpperCase());
}

export function generatePartnerCode(role, territoryOrState, existingCodes = []) {
  const prefix = role === 'MANAGER' ? 'MG' : 'AG';
  const stateCode = extractStateCode(territoryOrState);
  const used = new Set(
    (Array.isArray(existingCodes) ? existingCodes : [])
      .filter(Boolean)
      .map((c) => String(c).trim().toUpperCase())
  );

  let maxSeq = 0;
  const pattern = new RegExp(`^${prefix}-${stateCode}-(\\d+)$`);
  used.forEach((c) => {
    const m = c.match(pattern);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n) && n > maxSeq) maxSeq = n;
    }
  });

  let next = maxSeq + 1;
  let candidate = `${prefix}-${stateCode}-${String(next).padStart(3, '0')}`;
  while (used.has(candidate)) {
    next += 1;
    candidate = `${prefix}-${stateCode}-${String(next).padStart(3, '0')}`;
  }
  return candidate;
}

/**
 * Migrates any existing managers (e.g. GET-013 -> MG-ABJ-001) and agents
 * (e.g. GET-AG-042 -> AG-ABJ-001) while keeping every agent linked internally
 * to their manager's new MG-<STATE>-### code.
 */
export function migrateManagersAndAgentsCodes(managers = [], agents = []) {
  const usedMgrCodes = [];
  const oldToNewMgrCode = new Map();
  let changed = false;

  const migratedManagers = (Array.isArray(managers) ? managers : []).map((mgr) => {
    if (!mgr) return mgr;
    const oldCode = mgr.staffId || mgr.code || mgr.id;
    let newCode = oldCode;
    if (!isNewPartnerCodeFormat(oldCode, 'MANAGER')) {
      newCode = generatePartnerCode(
        'MANAGER',
        mgr.territoryName || mgr.territoryId || mgr.assignedDistricts || 'Abuja',
        usedMgrCodes
      );
      changed = true;
    }
    usedMgrCodes.push(newCode);
    if (oldCode) oldToNewMgrCode.set(oldCode, newCode);
    if (mgr.id) oldToNewMgrCode.set(mgr.id, newCode);

    return {
      ...mgr,
      staffId: newCode,
      referralCode: newCode,
      stateCode: extractStateCode(mgr.territoryName || mgr.territoryId || 'Abuja'),
      managerOverridePerStore: Number(mgr.managerOverridePerStore) || 1500,
    };
  });

  const usedAgentCodes = [];
  const migratedAgents = (Array.isArray(agents) ? agents : []).map((ag) => {
    if (!ag) return ag;
    const oldAgentCode = ag.agentStaffId || ag.code || ag.id;
    let newAgentCode = oldAgentCode;
    if (!isNewPartnerCodeFormat(oldAgentCode, 'AGENT')) {
      newAgentCode = generatePartnerCode(
        'AGENT',
        ag.territoryName || ag.territoryId || ag.assignedDistricts || 'Abuja',
        usedAgentCodes
      );
      changed = true;
    }
    usedAgentCodes.push(newAgentCode);

    const mappedMgrCode =
      (ag.managerId && oldToNewMgrCode.get(ag.managerId)) ||
      (migratedManagers.find((m) => m.territoryId === ag.territoryId)?.staffId) ||
      ag.managerId ||
      'HQ-OPS';

    if (mappedMgrCode !== ag.managerId) changed = true;

    return {
      ...ag,
      agentStaffId: newAgentCode,
      referralCode: newAgentCode,
      managerId: mappedMgrCode,
      stateCode: extractStateCode(ag.territoryName || ag.territoryId || 'Abuja'),
      commissionPerStore: Number(ag.commissionPerStore) || 5000,
    };
  });

  return {
    managers: migratedManagers,
    agents: migratedAgents,
    oldToNewMgrCode,
    changed,
  };
}
