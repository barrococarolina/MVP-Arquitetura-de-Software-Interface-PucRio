const baseURL = window.API_URL || "http://localhost:5000";

const $ = (id) => document.getElementById(id);

function mostrarMensagem(mensagem, tipo = "success") {
  const toast = $("toast");
  toast.textContent = mensagem;
  toast.className = `toast ${tipo} show`;
  setTimeout(() => toast.classList.remove("show"), 3200);
}

async function respostaJson(response) {
  const dados = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(dados.message || "Não foi possível concluir a operação.");
  }
  return dados;
}

function formatarCep(cep) {
  const numeros = cep.replace(/\D/g, "").slice(0, 8);
  return numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
}

$("cepAluno").addEventListener("input", (event) => {
  event.target.value = formatarCep(event.target.value);
});



async function carregarTurmas() {
  try {
    const response = await fetch(`${baseURL}/turma`);
    const dados = await respostaJson(response);
    const turmas = dados.turmas || [];

    $("listaTurmas").innerHTML = turmas.map((turma) => `
      <tr>
        <td>#${turma.id}</td>
        <td><strong>${escapeHtml(turma.nome)}</strong></td>
        <td><span class="badge ${turma.ativo ? "active" : "inactive"}">${turma.ativo ? "Ativa" : "Inativa"}</span></td>
        <td class="actions">
          <button class="small" onclick="editarTurma(${turma.id})">Editar</button>
          <button class="small danger" onclick="deleteTurma(${turma.id})">Excluir</button>
        </td>
      </tr>
    `).join("") || emptyRow(4, "Nenhuma turma cadastrada.");

    const selects = [$("turmaIdAluno"), $("filtroTurma")];
    const currentAluno = $("turmaIdAluno").value;
    selects[0].innerHTML = '<option value="">Selecione a turma</option>' + turmas.map(t => `<option value="${t.id}">${escapeHtml(t.nome)}${t.ativo ? "" : " (inativa)"}</option>`).join("");
    selects[1].innerHTML = '<option value="">Todas as turmas</option>' + turmas.map(t => `<option value="${t.id}">${escapeHtml(t.nome)}</option>`).join("");
    $("turmaIdAluno").value = currentAluno;
  } catch (error) {
    mostrarMensagem(error.message, "error");
  }
}

async function carregarAlunos() {
  try {
    const params = new URLSearchParams();
    const busca = $("buscaAluno").value.trim();
    const turmaId = $("filtroTurma").value;
    const ordenar = $("ordenacaoAluno").value;
    if (busca) params.set("buscaNome", busca);
    if (turmaId) params.set("turmaId", turmaId);
    if (ordenar) params.set("ordenar", ordenar);

    const response = await fetch(`${baseURL}/aluno?${params.toString()}`);
    const dados = await respostaJson(response);
    const alunos = dados.alunos || [];

    $("listaAlunos").innerHTML = alunos.map((aluno) => `
      <tr>
        <td>#${aluno.id}</td>
        <td><strong>${escapeHtml(aluno.nome)}</strong><small>${escapeHtml(aluno.email)}</small></td>
        <td>#${aluno.turmaId}</td>
        <td>${aluno.faltas}</td>
        <td>${escapeHtml(formatarEndereco(aluno))}</td>
        <td class="actions">
          <button class="small" onclick="editarAluno(${aluno.id})">Editar</button>
          <button class="small danger" onclick="deleteAluno(${aluno.id})">Excluir</button>
        </td>
      </tr>
    `).join("") || emptyRow(6, "Nenhum aluno encontrado.");
  } catch (error) {
    mostrarMensagem(error.message, "error");
  }
}

function formatarEndereco(aluno) {
  if (!aluno.cidade && !aluno.logradouro) return "—";
  const partes = [aluno.logradouro, aluno.bairro, aluno.cidade && `${aluno.cidade}/${aluno.uf}`].filter(Boolean);
  return `${partes.join(", ")} (${aluno.cep || "CEP não informado"})`;
}

function emptyRow(colunas, texto) {
  return `<tr><td colspan="${colunas}" class="empty">${texto}</td></tr>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
}

$("formTurma").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("idTurmaEdicao").value;
  const payload = { nome: $("nomeTurma").value.trim(), ativo: $("turmaAtiva").value === "true" };

  try {
    const response = await fetch(id ? `${baseURL}/turma/${id}` : `${baseURL}/turma`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await respostaJson(response);
    mostrarMensagem(id ? "Turma atualizada com sucesso!" : "Turma cadastrada com sucesso!");
    resetarFormularioTurma();
    await carregarTurmas();
    await carregarAlunos();
  } catch (error) {
    mostrarMensagem(error.message, "error");
  }
});

$("formAluno").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("idAlunoEdicao").value;
  const payload = {
    nome: $("nomeAluno").value.trim(),
    email: $("emailAluno").value.trim(),
    faltas: Number($("faltasAluno").value),
    turmaId: Number($("turmaIdAluno").value),
    cep: $("cepAluno").value.replace(/\D/g, ""),
  };

  try {
    const response = await fetch(id ? `${baseURL}/aluno/${id}` : `${baseURL}/aluno`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const aluno = await respostaJson(response);
    $("enderecoPreview").textContent = formatarEndereco(aluno);
    mostrarMensagem(id ? "Aluno atualizado com sucesso!" : "Aluno cadastrado com sucesso!");
    resetarFormularioAluno();
    await carregarAlunos();
  } catch (error) {
    mostrarMensagem(error.message, "error");
  }
});

async function editarTurma(id) {
  try {
    const turma = await respostaJson(await fetch(`${baseURL}/turma/${id}`));
    $("idTurmaEdicao").value = turma.id;
    $("nomeTurma").value = turma.nome;
    $("turmaAtiva").value = String(turma.ativo);
    $("btnSalvarTurma").textContent = "Salvar alterações";
    $("btnCancelarTurma").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) { mostrarMensagem(error.message, "error"); }
}

async function deleteTurma(id) {
  if (!confirm("Deseja realmente excluir esta turma? A turma só poderá ser excluída se não houver alunos vinculados.")) return;
  try {
    await respostaJson(await fetch(`${baseURL}/turma/${id}`, { method: "DELETE" }));
    mostrarMensagem("Turma excluída com sucesso!");
    await carregarTurmas();
  } catch (error) { mostrarMensagem(error.message, "error"); }
}

async function editarAluno(id) {
  try {
    const aluno = await respostaJson(await fetch(`${baseURL}/aluno/${id}`));
    $("idAlunoEdicao").value = aluno.id;
    $("nomeAluno").value = aluno.nome;
    $("emailAluno").value = aluno.email;
    $("faltasAluno").value = aluno.faltas;
    $("turmaIdAluno").value = aluno.turmaId;
    $("cepAluno").value = formatarCep(aluno.cep || "");
    $("enderecoPreview").textContent = formatarEndereco(aluno);
    $("btnSalvarAluno").textContent = "Salvar alterações";
    $("btnCancelarAluno").classList.remove("hidden");
    document.querySelector("#formAluno").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) { mostrarMensagem(error.message, "error"); }
}

async function deleteAluno(id) {
  if (!confirm("Deseja realmente excluir este aluno?")) return;
  try {
    await respostaJson(await fetch(`${baseURL}/aluno/${id}`, { method: "DELETE" }));
    mostrarMensagem("Aluno excluído com sucesso!");
    await carregarAlunos();
  } catch (error) { mostrarMensagem(error.message, "error"); }
}

function resetarFormularioTurma() {
  $("formTurma").reset();
  $("idTurmaEdicao").value = "";
  $("btnSalvarTurma").textContent = "Cadastrar turma";
  $("btnCancelarTurma").classList.add("hidden");
}

function resetarFormularioAluno() {
  $("formAluno").reset();
  $("idAlunoEdicao").value = "";
  $("faltasAluno").value = 0;
  $("btnSalvarAluno").textContent = "Cadastrar aluno";
  $("btnCancelarAluno").classList.add("hidden");
  $("enderecoPreview").textContent = "O endereço será preenchido automaticamente pelo ViaCEP.";
}

$("btnCancelarTurma").addEventListener("click", resetarFormularioTurma);
$("btnCancelarAluno").addEventListener("click", resetarFormularioAluno);
$("btnBuscar").addEventListener("click", carregarAlunos);
$("filtroTurma").addEventListener("change", carregarAlunos);
$("ordenacaoAluno").addEventListener("change", carregarAlunos);
$("buscaAluno").addEventListener("keydown", (event) => { if (event.key === "Enter") carregarAlunos(); });

(async function inicializar() {
  await carregarTurmas();
  await carregarAlunos();
})();
