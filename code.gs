function buildReportHTML(report) {
  report = report || {};
  report.safe = report.safe || {};
  report.prime = report.prime || {};
  report.risky = report.risky || {};
  report.suicide = report.suicide || {};
  function nv(v) {
    return (v === 0 || v === "0" || v === null || v === undefined) ? "Ø" : v;
  }
  return (
    '<div class="report-square">' +
      '<header>' +
        '<div class="command-verdict">COMMAND VERDICT</div>' +
        '<div class="main-title" style="color: var(--' + (report.verdictClass||"red") + ');">' + (report.verdictText||"") + '</div>' +
        '<div class="goal-pill">' + (report.verdictDesc||"") + '</div>' +
      '</header>' +
      '<hr class="separator-line">' +
      '<div class="summary-row">' +
        '<div class="summary-item">' +
          '<span class="value" style="color: var(--green);">' + nv(report.estRespect) + '</span>' +
          '<span class="label">Respect</span>' +
        '</div>' +
        '<div class="summary-item">' +
          '<span class="value" style="color: var(--red);">' + nv(report.wastedHits) + '</span>' +
          '<span class="label">Wasted</span>' +
        '</div>' +
        '<div class="summary-item">' +
          '<span class="value" style="color: var(--orange);">' + nv(report.efficiency) + '</span>' +
          '<span class="label">Efficiency</span>' +
        '</div>' +
      '</div>' +
      '<div class="card-grid">' +
        '<div class="card safe">' +
          '<div class="card-title" style="color: var(--green);">Safe</div>' +
          '<div class="stat-group"><span class="label">Targ</span><span class="value">' + nv(report.safe.targets) + '</span></div>' +
          '<div class="stat-group"><span class="label">Hits</span><span class="value">' + nv(report.safe.hits) + '</span></div>' +
          '<div class="stat-group"><span class="label">Resp</span><span class="value">' + nv(report.safe.respect) + '</span></div>' +
        '</div>' +
        '<div class="card prime">' +
          '<div class="card-title" style="color: var(--orange);">Prime</div>' +
          '<div class="stat-group"><span class="label">Targ</span><span class="value">' + nv(report.prime.targets) + '</span></div>' +
          '<div class="stat-group"><span class="label">Hits</span><span class="value">' + nv(report.prime.hits) + '</span></div>' +
          '<div class="stat-group"><span class="label">Resp</span><span class="value">' + nv(report.prime.respect) + '</span></div>' +
        '</div>' +
        '<div class="card risky">' +
          '<div class="card-title" style="color: var(--cyan);">Risky</div>' +
          '<div class="stat-group"><span class="label">Targ</span><span class="value">' + nv(report.risky.targets) + '</span></div>' +
          '<div class="stat-group"><span class="label">Hits</span><span class="value">' + nv(report.risky.hits) + '</span></div>' +
          '<div class="stat-group"><span class="label">Resp</span><span class="value">' + nv(report.risky.respect) + '</span></div>' +
        '</div>' +
        '<div class="card suicide">' +
          '<div class="card-title" style="color: var(--red);">Suicide</div>' +
          '<div class="stat-group"><span class="label">Targ</span><span class="value">' + nv(report.suicide.targets) + '</span></div>' +
          '<div class="stat-group">' +
            '<span class="label">Status</span>' +
            '<span class="status-val">Not Viable</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
}

function calculateRankWarReport(allData, yourTornStats, hitCount) {
  hitCount = hitCount || 20;
  const RESP_MULT = 2.71 * 1.40;
  yourTornStats = yourTornStats || 1;
  const categorized = {
    greenRisky: [], greenSafe: [],
    blueRisky: [], blueSafe: [],
    greenPrime: [], bluePrime: [],
    redSafe: [], redPrime: [],
    suicide: []
  };
  allData.forEach(function(member) {
    const ratio = yourTornStats / (member.total || 1);
    let winProb = 'red';
    if (ratio > 1.2) winProb = 'green';
    else if (ratio >= 0.85) winProb = 'blue';
    member.winProb = winProb;
    member.respect = member.ff * RESP_MULT;
    if (member.tier === 'suicide') {
      categorized.suicide.push(member);
    } else if (member.tier === 'risky') {
      if (winProb === 'green') categorized.greenRisky.push(member);
      else if (winProb === 'blue') categorized.blueRisky.push(member);
    } else if (member.tier === 'safe') {
      if (winProb === 'green') categorized.greenSafe.push(member);
      else if (winProb === 'blue') categorized.blueSafe.push(member);
      else categorized.redSafe.push(member);
    } else if (member.tier === 'prime') {
      if (winProb === 'green') categorized.greenPrime.push(member);
      else if (winProb === 'blue') categorized.bluePrime.push(member);
      else categorized.redPrime.push(member);
    }
  });
  let hits = [],
      hitsRemaining = hitCount,
      totalRespect = 0;
  function addTargets(list) {
    for (let i = 0; i < list.length && hitsRemaining > 0; i++) {
      hits.push(list[i]);
      totalRespect += list[i].respect;
      hitsRemaining--;
    }
  }
  [categorized.greenRisky, categorized.greenSafe, categorized.blueRisky, categorized.blueSafe, categorized.greenPrime, categorized.bluePrime, categorized.redSafe, categorized.redPrime].forEach(addTargets);
  const efficiency = +(totalRespect / hitCount).toFixed(2);
  const gapAnalysis = totalRespect >= 8 ? 0 : Math.ceil((8 - totalRespect) / efficiency);
  let verdict = 'EXCELLENT RANK WAR';
  let verdictColor = '#00ff88';
  if (efficiency < 4) {
    verdict = 'POOR RANK WAR';
    verdictColor = '#ff3333';
  } else if (efficiency < 7) {
    verdict = 'MODERATE RANK WAR';
    verdictColor = '#f4a460';
  }
  function sumProperty(arr, prop) {
    return arr.reduce((sum, obj) => sum + (+obj[prop] || 0), 0);
  }
  function countByTier(arr, tier) {
    return arr.filter(t => t.tier === tier).length;
  }
  const tierCounts = {
    prime: {
      targets: countByTier(allData, 'prime'),
      green: categorized.greenPrime.length,
      blue: categorized.bluePrime.length,
      red: categorized.redPrime.length,
      hitsUsed: hits.filter(h => h.tier === 'prime').length,
      respect: Math.round(sumProperty(hits.filter(h => h.tier === 'prime'), 'respect')),
      viable: categorized.greenPrime.length + categorized.bluePrime.length
    },
    safe: {
      targets: countByTier(allData, 'safe'),
      green: categorized.greenSafe.length,
      blue: categorized.blueSafe.length,
      red: categorized.redSafe.length,
      hitsUsed: hits.filter(h => h.tier === 'safe').length,
      respect: Math.round(sumProperty(hits.filter(h => h.tier === 'safe'), 'respect')),
      viable: categorized.greenSafe.length + categorized.blueSafe.length
    },
    risky: {
      targets: countByTier(allData, 'risky'),
      green: categorized.greenRisky.length,
      blue: categorized.blueRisky.length,
      red: 0,
      hitsUsed: hits.filter(h => h.tier === 'risky').length,
      respect: Math.round(sumProperty(hits.filter(h => h.tier === 'risky'), 'respect')),
      viable: categorized.greenRisky.length + categorized.blueRisky.length
    },
    suicide: {
      targets: categorized.suicide.length,
      green: 0, blue: 0, red: 0, hitsUsed: 0, respect: 0, viable: 0
    }
  };
  return {
    totalRespect: Math.round(totalRespect),
    efficiency: efficiency,
    gapAnalysis: gapAnalysis,
    verdict: verdict,
    verdictColor: verdictColor,
    tierCounts: tierCounts
  };
}

function getTierColor(tier) {
  const colors = { safe: '#f4a460', prime: '#00ff88', risky: '#00d4ff', suicide: '#ff3333' };
  return colors[tier] || '#888';
}
function getTierLabel(tier) {
  const labels = { prime: 'Prime', safe: 'Safe', risky: 'Risky', suicide: 'Suicide' };
  return labels[tier] || 'UNKNOWN';
}

let SESSION = { uid:0, myStats:0, rawData:[], counts:{amber:0,green:0,blue:0,red:0} };

function formatStats(num) {
  if (!num || num === 0) return "---";
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  return num.toLocaleString();
}

function engage() {
  const uid = document.getElementById('m-uid').value;
  const fid = document.getElementById('m-fid').value;
  SESSION.uid = uid;
  document.getElementById('h-status').textContent = "FETCHING OPERATOR...";
  google.script.run.withSuccessHandler(user => {
    if(user.errCode) {
       document.getElementById('h-status').textContent = "API ERR: " + user.errCode;
       return;
    }
    document.getElementById('h-user').textContent = user.name;
    SESSION.myStats = Number(user.total);
    document.getElementById('m-my-stats').textContent = formatStats(SESSION.myStats);
    document.getElementById('h-power').textContent = formatStats(SESSION.myStats);
    document.getElementById('h-status').textContent = "SCANNING FACTION...";
    google.script.run.withSuccessHandler(fData => {
      if(fData.error) {
        document.getElementById('h-status').textContent = "FACTION ERR";
        return;
      }
      toggleOverride();
      document.getElementById('h-status').textContent = "OPERATIONAL";
      startScan(fData);
    }).getFactionData(fid);
  }).getUserName(uid);
}

function startScan(d){
  document.getElementById('grid').innerHTML = '';
  SESSION.rawData = [];
  SESSION.counts = {amber:0,green:0,blue:0,red:0};
  const members = Object.keys(d.members || {});
  if(!members.length) {
    document.getElementById('h-status').textContent = "NO MEMBERS";
    return;
  }
  const CHUNK = 12;
  for(let i=0;i<members.length;i+=CHUNK){
    const chunkIds = members.slice(i, i+CHUNK);
    const chunkCsv = chunkIds.join(',');
    google.script.run.withSuccessHandler(results => {
      results.forEach((scData, idx) => {
        const id = chunkIds[idx];
        const scDatum = (scData && scData[0]) ? scData[0] : scData || { fair_fight: 1.0, bs_estimate: 0 };
        const total = Number(scDatum.bs_estimate) || 0;
        const ff = Number(scDatum.fair_fight) || 1.0;
        let tier;
        if (ff < 3.2) tier = 'amber';
        else if (ff < 4.7) tier = 'green';
        else if (ff < 5.3) tier = 'blue';
        else tier = 'red';
        const obj = { m: d.members[id], id, total, ff, tier };
        SESSION.rawData.push(obj);
        SESSION.counts[tier]++;
        renderCard(obj);
        updateBreakdown();
      });
    }).getScouterDataBatch(chunkCsv, SESSION.uid);
  }
}

function renderCard(obj){
  const card = document.createElement('div');
  card.className = 'card';
  card.style.borderLeft = '4px solid var(--'+obj.tier+')';
  card.innerHTML =
    '<div>' +
      '<div style="color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x FF</div>' +
      '<div style="font-size:13px;">' + obj.m.name + '</div>' +
    '</div>' +
    '<div style="text-align:right;">' +
      '<div class="label" style="margin:0;">EST. POWER</div>' +
      '<div style="font-size:14px; font-weight:700; color:#fff;">' + formatStats(obj.total) + '</div>' +
      '</div>';
  card.ondblclick = closeIntel;
  document.getElementById('grid').prepend(card);
}

function closeIntel(){
  document.getElementById('intel-area').style.display = 'none';
}

function updateBreakdown(){
  const cont = document.getElementById('breakdown');
  cont.innerHTML = '';
  Object.keys(SESSION.counts).forEach(t => {
    if(SESSION.counts[t] > 0) {
      const pill = document.createElement('div');
      pill.className = 'nav-pill';
      pill.style.color = 'var(--'+t+')';
      pill.style.borderColor = 'var(--'+t+')';
      pill.textContent = SESSION.counts[t] + ' ' + t.toUpperCase();
      pill.onclick = () => showTacticalBriefing(t);
      cont.appendChild(pill);
    }
  });
}

function showTacticalBriefing(tier) {
  const targets = SESSION.rawData
    .filter(t => t.tier === tier)
    .sort((a,b) => b.ff - a.ff)
    .slice(0,3);
  document.getElementById('m-tier-label').textContent = tier.toUpperCase();
  document.getElementById('m-tier-label').style.color = 'var(--'+tier+')';
  let html = '';
  targets.forEach(t => {
    const ratio = SESSION.myStats / (t.total || 1);
    const advice = ratio > 1.5 ? "DOMINANT" : ratio > 0.9 ? "FAVORABLE" : "HIGH RISK";
    html +=
      '<div class="target-row" style="border-left: 5px solid var(--' + tier + ')">' +
        '<div style="flex:1.5;">' +
          '<div class="label">TARGET</div>' +
          '<div style="font-size:16px; font-weight:700;">' + t.m.name + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div class="label">EST. POWER</div>' +
          '<div style="font-size:14px; color:#fff;">' + formatStats(t.total) + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div class="label">MULT</div>' +
          '<div style="font-size:14px; color:var(--' + tier + '); font-weight:700;">' + t.ff.toFixed(2) + 'x</div>' +
        '</div>' +
        '<div style="flex:2;">' +
          '<div class="label">ADVICE</div>' +
          '<div style="font-size:10px; font-weight:600; color:#aaa;">' + advice + '</div>' +
          '<div style="display:flex; gap:8px; margin-top:8px;">' +
            '<a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + t.id + '" target="_blank" class="nav-pill" style="background:var(--green); color:#000; padding:5px 12px; font-size:9px;">ENGAGE</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  });
  document.getElementById('briefing-content').innerHTML =
    html || '<div style="padding:40px; text-align:center;">NO DATA.</div>';
  document.getElementById('main-ui').classList.add('blur');
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('main-ui').classList.remove('blur');
}

function generateReport() {
  var allData = SESSION.rawData;
  var yourTornStats = SESSION.myStats; // Use SESSION.myStats (see engage function)
  var hitCount = 20;
  var calc = calculateRankWarReport(allData, yourTornStats, hitCount);
  // Populate the modal UI with the calc results here, as in your original generateReport logic.
  // For example:
  // document.getElementById('modal-faction-name').textContent = ...;
  // document.getElementById('modal-report-verdict-main').textContent = calc.verdict;
  // ...etc.
}