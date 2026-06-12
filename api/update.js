module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { password, projects } = req.body || {};

  if (!password || !projects) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  // Valida senha contra variável de ambiente (nunca exposta ao cliente)
  // .trim() remove \r residual que PowerShell/CLI pode inserir ao salvar a env var
  if (password !== (process.env.ADMIN_PASSWORD || '').trim()) {
    await new Promise(r => setTimeout(r, 1500));
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  const repo  = (process.env.GITHUB_REPO  || '').trim();
  const token = (process.env.GITHUB_TOKEN || '').trim();

  if (!repo || !token) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

  const apiBase = `https://api.github.com/repos/${repo}/contents/projects.json`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'portfolio-admin'
  };

  // Busca SHA atual do arquivo (obrigatório para o PUT do GitHub)
  const getRes = await fetch(apiBase, { headers });
  if (!getRes.ok) {
    return res.status(500).json({ error: 'Erro ao buscar arquivo no GitHub' });
  }
  const { sha } = await getRes.json();

  // Envia novo conteúdo
  const content = Buffer.from(JSON.stringify(projects, null, 2)).toString('base64');
  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: 'chore: update projects via admin panel',
      content,
      sha,
      branch: 'main'
    })
  });

  if (putRes.ok) {
    return res.status(200).json({ ok: true, message: 'Salvo! O site atualiza em ~30 segundos.' });
  }

  const err = await putRes.json();
  return res.status(500).json({ error: 'Erro ao salvar no GitHub', detail: err.message });
};
