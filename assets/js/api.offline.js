// ===== BANCO EM MEMÓRIA =====
let fakeDB = {
  departamentos: [],
  usuarios: [],
  chamados: []
};

let idCounters = {
  departamentos: 1,
  usuarios: 1,
  chamados: 1
};

// ===== SIMULAÇÃO DE LATÊNCIA =====
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== API FAKE =====
async function apiRequest(endpoint, method = "GET", body = null) {
  await delay(); // simula tempo de resposta

  // ===== DEPARTAMENTOS =====
  if (endpoint === "/departamentos") {
    if (method === "GET") return fakeDB.departamentos;

    if (method === "POST") {
      const novo = {
        id: idCounters.departamentos++,
        ...body
      };

      fakeDB.departamentos.push(novo);
      return novo;
    }
  }

  // ===== USUÁRIOS =====
  if (endpoint === "/usuarios") {
    if (method === "GET") {
      return fakeDB.usuarios.map(u => {
        const depto = fakeDB.departamentos.find(d => d.id === u.id_depto);
        return {
          ...u,
          departamento: depto ? depto.nome : "-"
        };
      });
    }

    if (method === "POST") {
      const novo = {
        id: idCounters.usuarios++,
        ...body
      };

      fakeDB.usuarios.push(novo);
      return novo;
    }
  }

  // ===== CHAMADOS =====
  if (endpoint === "/chamados") {
    if (method === "GET") {
      return fakeDB.chamados.map(c => {
        const usuario = fakeDB.usuarios.find(u => u.id === c.id_usuario);
        const depto = usuario
          ? fakeDB.departamentos.find(d => d.id === usuario.id_depto)
          : null;

        return {
          ...c,
          usuario: usuario ? usuario.nome : "-",
          departamento: depto ? depto.nome : "-"
        };
      });
    }

    if (method === "POST") {
      const novo = {
        id: idCounters.chamados++,
        status: "aberto",
        ...body
      };

      fakeDB.chamados.push(novo);
      return novo;
    }
  }

  // ===== UPDATE CHAMADO =====
  if (endpoint.startsWith("/chamados/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);

    const chamado = fakeDB.chamados.find(c => c.id === id);
    if (!chamado) throw new Error("Chamado não encontrado");

    Object.assign(chamado, body);
    return chamado;
  }

  // ===== DELETE CHAMADO =====
  if (endpoint.startsWith("/chamados/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);

    fakeDB.chamados = fakeDB.chamados.filter(c => c.id !== id);
    return { success: true };
  }

  throw new Error("Endpoint não implementado: " + endpoint);
}