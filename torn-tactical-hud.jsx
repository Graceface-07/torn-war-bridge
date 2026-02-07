import React, { useState } from 'react';
import { Activity, Target, Shield, Zap, Users, Package, DollarSign, TrendingUp, X, AlertTriangle, Clock, Crosshair } from 'lucide-react';

export default function TornTacticalHUD() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [userData, setUserData] = useState({
    userId: '',
    totalStats: '',
    factionId: '',
    mode: 'war'
  });
  const [showSetup, setShowSetup] = useState(true);

  // Sample war data (would be fetched from Torn API in production)
  const warData = {
    verdict: 'COMMAND VERDICT',
    title: 'POOR RANK WAR',
    goal: '8.0 GOAL MATHEMATICALLY IMPOSSIBLE',
    respect: 38.91,
    wasted: 'Ø',
    efficiency: 1.95,
    categories: [
      {
        name: 'SAFE',
        color: '#00ff9c',
        targets: 45,
        hits: 20,
        respect: 38.9
      },
      {
        name: 'PRIME',
        color: '#ff9d00',
        targets: 'Ø',
        hits: 'Ø',
        respect: 0.0
      },
      {
        name: 'RISKY',
        color: '#00d2ff',
        targets: 2,
        hits: 'Ø',
        respect: 0.0
      },
      {
        name: 'SUICIDE',
        color: '#ff2b2b',
        targets: 13,
        status: 'NOT VIABLE'
      }
    ]
  };

  const targets = [
    { id: 1, name: 'PlayerOne', level: 45, stats: 2.5, ff: 1.85, status: 'online', category: 'prime', respect: 450, threat: 'medium' },
    { id: 2, name: 'TargetTwo', level: 38, stats: 1.8, ff: 2.1, status: 'online', category: 'safe', respect: 280, threat: 'low' },
    { id: 3, name: 'DangerZone', level: 52, stats: 4.2, ff: 0.95, status: 'offline', category: 'risky', respect: 680, threat: 'high' },
    { id: 4, name: 'EasyMark', level: 32, stats: 1.2, ff: 2.8, status: 'hospital', category: 'safe', respect: 190, threat: 'low' },
    { id: 5, name: 'BossMan', level: 68, stats: 8.5, ff: 0.45, status: 'online', category: 'suicide', respect: 1200, threat: 'unknown' },
  ];

  const modules = [
    { id: 'combat', name: 'Combat', icon: Crosshair, color: '#ff2b2b' },
    { id: 'faction', name: 'Faction', icon: Users, color: '#00d2ff' },
    { id: 'inventory', name: 'Inventory', icon: Package, color: '#00ff9c' },
    { id: 'money', name: 'Finances', icon: DollarSign, color: '#ff9d00' },
    { id: 'stats', name: 'Stats', icon: TrendingUp, color: '#a855f7' },
    { id: 'targets', name: 'Targets', icon: Target, color: '#ec4899' }
  ];

  const handleSetup = () => {
    if (userData.userId && userData.totalStats && userData.factionId) {
      setShowSetup(false);
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'prime': return '#ff9d00';
      case 'safe': return '#00ff9c';
      case 'risky': return '#00d2ff';
      case 'suicide': return '#ff2b2b';
      default: return '#888';
    }
  };

  const getThreatColor = (threat) => {
    switch(threat) {
      case 'low': return '#00ff9c';
      case 'medium': return '#ff9d00';
      case 'high': return '#ff2b2b';
      default: return '#888';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%)',
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      color: '#fff',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Setup Modal */}
      {showSetup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a2a 100%)',
            padding: '40px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(255, 43, 43, 0.3)'
          }}>
            <h2 style={{
              fontSize: '28px',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #ff2b2b, #ff9d00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700',
              letterSpacing: '2px'
            }}>TACTICAL INITIALIZATION</h2>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '30px', letterSpacing: '1px' }}>
              Configure your combat parameters
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                User ID
              </label>
              <input
                type="text"
                value={userData.userId}
                onChange={(e) => setUserData({...userData, userId: e.target.value})}
                placeholder="Enter your Torn ID"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff2b2b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Total Battle Stats
              </label>
              <input
                type="text"
                value={userData.totalStats}
                onChange={(e) => setUserData({...userData, totalStats: e.target.value})}
                placeholder="e.g., 1.5B"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff2b2b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Faction ID
              </label>
              <input
                type="text"
                value={userData.factionId}
                onChange={(e) => setUserData({...userData, factionId: e.target.value})}
                placeholder="Your faction ID"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ff2b2b'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Mode
              </label>
              <select
                value={userData.mode}
                onChange={(e) => setUserData({...userData, mode: e.target.value})}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              >
                <option value="war">Rank War</option>
                <option value="chain">Chain Mode</option>
                <option value="retaliation">Retaliation</option>
                <option value="spy">Spy Only</option>
              </select>
            </div>

            <button
              onClick={handleSetup}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, #ff2b2b, #ff6b2b)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 43, 43, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 43, 43, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 43, 43, 0.4)';
              }}
            >
              Initialize System
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      {!showSetup && (
        <>
          {/* Header */}
          <div style={{
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ff2b2b, #ff9d00, #00d2ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '4px',
              marginBottom: '10px',
              textShadow: '0 0 40px rgba(255, 43, 43, 0.3)'
            }}>
              TACTICAL HUD
            </h1>
            <p style={{
              color: '#888',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              Torn Combat Intelligence System
            </p>
          </div>

          {/* Module Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
            maxWidth: '1400px',
            margin: '0 auto 40px'
          }}>
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(42, 26, 42, 0.6))',
                    padding: '30px',
                    borderRadius: '20px',
                    border: `1px solid ${module.color}33`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.borderColor = module.color;
                    e.currentTarget.style.boxShadow = `0 10px 30px ${module.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.borderColor = `${module.color}33`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${module.color}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                  }} />
                  
                  <Icon size={32} color={module.color} style={{ marginBottom: '15px' }} />
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    color: '#fff',
                    textTransform: 'uppercase'
                  }}>
                    {module.name}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Module Detail Panel */}
          {selectedModule && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 999,
              backdropFilter: 'blur(15px)',
              padding: '20px',
              overflowY: 'auto'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedModule(null);
            }}
            >
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a2a 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '40px',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedModule(null)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 43, 43, 0.2)',
                    border: '1px solid #ff2b2b',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ff2b2b';
                    e.target.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 43, 43, 0.2)';
                    e.target.style.transform = 'rotate(0deg)';
                  }}
                >
                  <X size={20} color="#fff" />
                </button>

                {/* Combat Module */}
                {selectedModule === 'combat' && (
                  <div>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #ff2b2b, #ff9d00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '30px',
                      letterSpacing: '2px'
                    }}>
                      COMBAT INTELLIGENCE
                    </h2>

                    {/* War Report Summary */}
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '16px',
                      padding: '30px',
                      marginBottom: '30px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '5px' }}>
                          {warData.verdict}
                        </div>
                        <div style={{ fontSize: '24px', color: '#ff2b2b', fontWeight: '700', marginBottom: '10px' }}>
                          {warData.title}
                        </div>
                        <div style={{ fontSize: '9px', color: '#888' }}>
                          {warData.goal}
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#00ff9c' }}>
                            {warData.respect}
                          </div>
                          <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
                            RESPECT
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff2b2b' }}>
                            {warData.wasted}
                          </div>
                          <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
                            WASTED
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff9d00' }}>
                            {warData.efficiency}
                          </div>
                          <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', letterSpacing: '1px' }}>
                            EFFICIENCY
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '15px',
                        marginTop: '30px'
                      }}>
                        {warData.categories.map((cat, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(17, 17, 17, 0.8)',
                              borderRadius: '12px',
                              padding: '20px 10px',
                              borderTop: `3px solid ${cat.color}`,
                              border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <div style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              color: cat.color,
                              textAlign: 'center',
                              marginBottom: '12px',
                              letterSpacing: '1px'
                            }}>
                              {cat.name}
                            </div>
                            {cat.status ? (
                              <div style={{
                                textAlign: 'center',
                                fontSize: '9px',
                                color: '#ff2b2b',
                                fontWeight: '600'
                              }}>
                                {cat.status}
                              </div>
                            ) : (
                              <>
                                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                                  <div style={{ fontSize: '8px', color: '#666' }}>TARG</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{cat.targets}</div>
                                </div>
                                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                                  <div style={{ fontSize: '8px', color: '#666' }}>HITS</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{cat.hits}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '8px', color: '#666' }}>RESP</div>
                                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{cat.respect}</div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Targets Module */}
                {selectedModule === 'targets' && (
                  <div>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #ec4899, #ff9d00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '30px',
                      letterSpacing: '2px'
                    }}>
                      TARGET ANALYSIS
                    </h2>

                    <div style={{
                      display: 'grid',
                      gap: '15px'
                    }}>
                      {targets.map((target) => (
                        <div
                          key={target.id}
                          style={{
                            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6), rgba(42, 26, 42, 0.4))',
                            borderRadius: '16px',
                            padding: '20px',
                            border: `1px solid ${getCategoryColor(target.category)}`,
                            borderLeft: `4px solid ${getCategoryColor(target.category)}`,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(5px)';
                            e.currentTarget.style.boxShadow = `0 5px 20px ${getCategoryColor(target.category)}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '4px 12px',
                            background: getThreatColor(target.threat) + '20',
                            border: `1px solid ${getThreatColor(target.threat)}`,
                            borderRadius: '12px',
                            fontSize: '9px',
                            fontWeight: '600',
                            color: getThreatColor(target.threat),
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}>
                            {target.threat}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#fff',
                                marginBottom: '8px'
                              }}>
                                {target.name}
                                <span style={{
                                  fontSize: '11px',
                                  color: '#888',
                                  marginLeft: '10px',
                                  fontWeight: '400'
                                }}>
                                  LVL {target.level}
                                </span>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '15px',
                                marginTop: '12px'
                              }}>
                                <div>
                                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>
                                    STATS
                                  </div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#00d2ff' }}>
                                    {target.stats}B
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>
                                    FF MULT
                                  </div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#ff9d00' }}>
                                    {target.ff}x
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>
                                    RESPECT
                                  </div>
                                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#00ff9c' }}>
                                    {target.respect}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div style={{
                              padding: '8px 16px',
                              background: target.status === 'online' ? '#00ff9c20' : target.status === 'hospital' ? '#ff2b2b20' : '#88888820',
                              border: `1px solid ${target.status === 'online' ? '#00ff9c' : target.status === 'hospital' ? '#ff2b2b' : '#888'}`,
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: '600',
                              color: target.status === 'online' ? '#00ff9c' : target.status === 'hospital' ? '#ff2b2b' : '#888',
                              textTransform: 'uppercase',
                              letterSpacing: '1px'
                            }}>
                              {target.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Modules Placeholder */}
                {['faction', 'inventory', 'money', 'stats'].includes(selectedModule) && (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '20px',
                      opacity: 0.3
                    }}>
                      {modules.find(m => m.id === selectedModule)?.icon && 
                        React.createElement(modules.find(m => m.id === selectedModule).icon, { 
                          size: 64, 
                          color: modules.find(m => m.id === selectedModule).color 
                        })
                      }
                    </div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: modules.find(m => m.id === selectedModule)?.color,
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px'
                    }}>
                      {modules.find(m => m.id === selectedModule)?.name} Module
                    </h3>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                      This module is under development. Connect to Torn API for live data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Command Bar */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(42, 26, 42, 0.95))',
            backdropFilter: 'blur(20px)',
            padding: '15px 30px',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '30px',
            alignItems: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#00ff9c" />
              <span style={{ fontSize: '11px', color: '#888', marginRight: '5px' }}>MODE:</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#00ff9c', textTransform: 'uppercase' }}>
                {userData.mode}
              </span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#00d2ff" />
              <span style={{ fontSize: '11px', color: '#888', marginRight: '5px' }}>FACTION:</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#00d2ff' }}>
                {userData.factionId}
              </span>
            </div>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#ff9d00" />
              <span style={{ fontSize: '11px', color: '#888', marginRight: '5px' }}>STATS:</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#ff9d00' }}>
                {userData.totalStats}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
