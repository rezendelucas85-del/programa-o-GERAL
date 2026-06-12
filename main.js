async function loadProjects() {
  const grid = document.getElementById('project-grid');

  try {
    const res = await fetch('/projects.json');
    if (!res.ok) throw new Error();
    const projects = await res.json();

    grid.innerHTML = projects.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      const tags = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
      return `
        <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="project-card">
          <div class="project-number">${num}</div>
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <div class="tags">${tags}</div>
          <div class="project-link">Ver projeto <span class="arrow">→</span></div>
        </a>`;
    }).join('');
  } catch {
    // mantém o conteúdo estático do HTML como fallback
  }
}

loadProjects();
