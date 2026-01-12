var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    };

    if (!idParam) return new Response(JSON.stringify({ error: "No ID" }), { status: 400, headers });

    const ids = idParam.split(",");
    
    // GENERATE DUMMY DATA FOR TESTING
    const dummyResults = ids.map(id => ({
      id: id.trim(),
      name: "Test_User_" + id.trim(),
      level: Math.floor(Math.random() * 100),
      total: 5000000,
      strength: 1250000,
      defense: 1250000,
      speed: 1250000,
      dexterity: 1250000,
      status: "Okay",
      last_updated: new Date().toISOString()
    }));

    return new Response(JSON.stringify(dummyResults), { headers });
  }
};

export { worker_default as default };