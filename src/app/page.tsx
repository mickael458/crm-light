"use client";

import Link from "next/link";

export default function Home() {
  const faqs = [
    {
      q: "Est-ce vraiment sans carte bancaire pour l'essai ?",
      a: "Oui, aucune carte n'est demandée pendant les 14 jours d'essai. Vous entrez votre moyen de paiement uniquement si vous choisissez de continuer.",
    },
    {
      q: "Mes données sont-elles hébergées en Europe ?",
      a: "Oui, les données sont hébergées en Europe avec des services compatibles RGPD.",
    },
    {
      q: "Puis-je importer mes contacts existants ?",
      a: "Oui, vous pouvez importer un fichier CSV depuis Excel, Google Sheets, ou exporter depuis HubSpot ou Notion. Le processus prend moins de 2 minutes.",
    },
    {
      q: "Que se passe-t-il si j'annule ?",
      a: "Vous pouvez annuler à tout moment depuis votre compte, en un clic. Vous gardez l'accès jusqu'à la fin de la période en cours, et vous pouvez exporter toutes vos données avant de partir.",
    },
    {
      q: "Est-ce adapté si j'ai une petite équipe ?",
      a: "Le plan Solo est prévu pour 1 utilisateur. Un plan Équipe (jusqu'à 5 utilisateurs) est en cours de développement — inscrivez-vous pour être notifié en priorité.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #2563eb; --blue-light: #eff6ff; --blue-mid: #bfdbfe;
          --green: #16a34a; --green-light: #f0fdf4;
          --text: #111827; --muted: #6b7280; --border: #e5e7eb;
          --surface: #f9fafb; --white: #ffffff;
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: var(--text); background: var(--white); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        .lp-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
        .lp-nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: var(--text); text-decoration: none; }
        .lp-nav-logo span { color: var(--blue); }
        .lp-nav-links { display: flex; align-items: center; gap: 24px; }
        .lp-nav-links a { font-size: 13px; color: var(--muted); text-decoration: none; }
        .lp-nav-links a:hover { color: var(--text); }
        .lp-nav-cta { padding: 8px 18px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
        .lp-nav-cta:hover { background: #1d4ed8; }
        .lp-hero { max-width: 760px; margin: 0 auto; padding: 80px 24px 72px; text-align: center; }
        .lp-hero-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--blue); background: var(--blue-light); border: 1px solid var(--blue-mid); padding: 4px 12px; border-radius: 99px; margin-bottom: 24px; }
        .lp-hero-badge span { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); display: inline-block; }
        .lp-h1 { font-family: 'Syne', sans-serif; font-size: clamp(36px, 6vw, 56px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: var(--text); margin-bottom: 20px; }
        .lp-h1 em { font-style: normal; color: var(--blue); }
        .lp-hero-sub { font-size: 18px; color: var(--muted); line-height: 1.65; max-width: 560px; margin: 0 auto 36px; }
        .lp-hero-cta-group { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .lp-btn-big { padding: 14px 28px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; transition: background 0.15s, transform 0.1s; }
        .lp-btn-big:hover { background: #1d4ed8; transform: translateY(-1px); }
        .lp-btn-outline { padding: 14px 22px; background: transparent; color: var(--text); border: 1.5px solid var(--border); border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; text-decoration: none; transition: border-color 0.15s; }
        .lp-btn-outline:hover { border-color: #9ca3af; }
        .lp-hero-reassurance { font-size: 13px; color: var(--muted); }
        .lp-hero-reassurance strong { color: var(--text); }
        .lp-proof-bar { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--surface); padding: 16px 24px; display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
        .lp-proof-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); }
        .lp-proof-item svg { width: 16px; height: 16px; color: var(--green); flex-shrink: 0; }
        .lp-mockup-section { max-width: 900px; margin: 64px auto; padding: 0 24px; }
        .lp-mockup-frame { border: 1px solid var(--border); border-radius: 14px; overflow: hidden; background: #f1f5f9; }
        .lp-mockup-bar { background: #e2e8f0; padding: 10px 16px; display: flex; align-items: center; gap: 6px; }
        .lp-mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-mockup-url { margin-left: 12px; flex: 1; background: #fff; border-radius: 4px; padding: 3px 10px; font-size: 11px; color: var(--muted); max-width: 320px; }
        .lp-mockup-body { display: flex; height: 440px; overflow: hidden; }
        .lp-mockup-mobile { display: none; padding: 24px; background: #fff; text-align: left; }
        .lp-mockup-mobile-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .lp-mockup-mobile-text { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .lp-mockup-mobile-pills { display: grid; gap: 8px; margin-top: 18px; }
        .lp-mockup-mobile-pill { display: flex; align-items: center; justify-content: space-between; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #111827; background: #f8fafc; }
        .lp-mockup-mobile-pill span { color: var(--blue); font-weight: 700; }
        .lp-mock-sidebar { width: 180px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0; padding: 16px 0; display: flex; flex-direction: column; }
        .lp-mock-logo { padding: 0 16px 16px; font-weight: 800; font-size: 15px; font-family: 'Syne', sans-serif; color: #111; }
        .lp-mock-logo span { color: #2563eb; }
        .lp-mock-nav { padding: 5px 12px; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 7px; border-radius: 5px; margin: 0 6px 1px; }
        .lp-mock-nav.active { background: #eff6ff; color: #1d4ed8; font-weight: 500; }
        .lp-mock-nav-ico { width: 14px; height: 14px; background: currentColor; border-radius: 2px; opacity: 0.5; flex-shrink: 0; }
        .lp-mock-main { flex: 1; background: #f8fafc; padding: 16px; overflow: hidden; }
        .lp-mock-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .lp-mock-title { font-weight: 600; font-size: 14px; color: #111; }
        .lp-mock-btn { padding: 5px 12px; background: #2563eb; color: #fff; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .lp-mock-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
        .lp-mock-metric { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
        .lp-mock-mlabel { font-size: 10px; color: #9ca3af; margin-bottom: 2px; }
        .lp-mock-mval { font-size: 17px; font-weight: 600; color: #111; }
        .lp-mock-msub { font-size: 9px; color: #16a34a; }
        .lp-mock-pipeline { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .lp-mock-col-title { font-size: 10px; font-weight: 600; color: #6b7280; margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
        .lp-mock-col-dot { width: 6px; height: 6px; border-radius: 50%; }
        .lp-mock-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 6px; }
        .lp-mock-card-name { font-size: 10px; font-weight: 600; color: #111; margin-bottom: 1px; }
        .lp-mock-card-co { font-size: 9px; color: #9ca3af; margin-bottom: 5px; }
        .lp-mock-card-amt { font-size: 10px; font-weight: 600; color: #111; }
        .lp-features { max-width: 900px; margin: 0 auto 80px; padding: 0 24px; }
        .lp-section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; }
        .lp-section-title { font-family: 'Syne', sans-serif; font-size: clamp(26px, 4vw, 36px); font-weight: 800; line-height: 1.2; color: var(--text); margin-bottom: 12px; }
        .lp-section-sub { font-size: 16px; color: var(--muted); max-width: 520px; margin-bottom: 48px; line-height: 1.6; }
        .lp-features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .lp-feature-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 22px; transition: border-color 0.15s; }
        .lp-feature-card:hover { border-color: var(--blue-mid); }
        .lp-feature-icon { width: 38px; height: 38px; background: var(--blue-light); border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .lp-feature-icon svg { width: 18px; height: 18px; color: var(--blue); }
        .lp-feature-title { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .lp-feature-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }
        .lp-compare { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 64px 24px; margin-bottom: 80px; }
        .lp-compare-inner { max-width: 760px; margin: 0 auto; }
        .lp-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
        .lp-compare-col { border-radius: 12px; padding: 24px; }
        .lp-compare-col.bad { background: #fff; border: 1px solid var(--border); }
        .lp-compare-col.good { background: #fff; border: 2px solid var(--blue); }
        .lp-compare-col-title { font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
        .lp-compare-col.good .lp-compare-col-title { color: var(--blue); }
        .lp-compare-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 14px; }
        .lp-compare-item svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
        .lp-bad-ico { color: #9ca3af; }
        .lp-good-ico { color: var(--green); }
        .lp-testimonials { background: var(--surface); border-top: 1px solid var(--border); padding: 64px 24px; margin-bottom: 80px; }
        .lp-testimonials-inner { max-width: 900px; margin: 0 auto; }
        .lp-testimonials-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; margin-top: 40px; }
        .lp-testimonial-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 22px; }
        .lp-testimonial-stars { color: #f59e0b; font-size: 14px; margin-bottom: 10px; letter-spacing: 1px; }
        .lp-testimonial-text { font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 16px; font-style: italic; }
        .lp-testimonial-author { display: flex; align-items: center; gap: 10px; }
        .lp-testimonial-av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .lp-av-b { background: #dbeafe; color: #1d4ed8; }
        .lp-av-g { background: #dcfce7; color: #166534; }
        .lp-av-p { background: #ede9fe; color: #6d28d9; }
        .lp-testimonial-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .lp-testimonial-role { font-size: 11px; color: var(--muted); }
        .lp-pricing { max-width: 520px; margin: 0 auto 80px; padding: 0 24px; text-align: center; }
        .lp-pricing-card { background: var(--white); border: 2px solid var(--blue); border-radius: 16px; padding: 44px 36px 36px; margin-top: 40px; text-align: left; position: relative; }
        .lp-pricing-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--blue); color: #fff; font-size: 11px; font-weight: 600; padding: 4px 14px; border-radius: 99px; white-space: nowrap; }
        .lp-pricing-plan { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .lp-pricing-price { font-family: 'Syne', sans-serif; font-size: 52px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .lp-pricing-price sup { font-size: 24px; vertical-align: super; }
        .lp-pricing-price sub { font-size: 16px; font-weight: 400; color: var(--muted); vertical-align: baseline; }
        .lp-pricing-desc { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
        .lp-pricing-features { list-style: none; margin-bottom: 28px; }
        .lp-pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); padding: 7px 0; border-bottom: 1px solid var(--border); }
        .lp-pricing-features li:last-child { border-bottom: none; }
        .lp-pricing-features li svg { width: 15px; height: 15px; color: var(--green); flex-shrink: 0; }
        .lp-pricing-cta { width: 100%; padding: 15px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; }
        .lp-pricing-cta:hover { background: #1d4ed8; transform: translateY(-1px); }
        .lp-pricing-note { font-size: 12px; color: var(--muted); margin-top: 12px; text-align: center; }
        .lp-faq { max-width: 640px; margin: 0 auto 80px; padding: 0 24px; }
        .lp-faq-item { border-bottom: 1px solid var(--border); padding: 18px 0;  }
        .lp-faq-item:last-child { border-bottom: none; }
        .lp-faq-q { font-size: 15px; font-weight: 500; color: var(--text); display: flex; justify-content: space-between; align-items: center; gap: 12px; cursor: pointer; list-style: none; }
        .lp-faq-q::-webkit-details-marker { display: none; }
        .lp-faq-q svg { flex-shrink: 0; transition: transform 0.2s; }
        .lp-faq-item[open] .lp-faq-q svg { transform: rotate(180deg); }
        .lp-faq-a { font-size: 14px; color: var(--muted); line-height: 1.65; max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding-top 0.2s; }
        .lp-faq-item[open] .lp-faq-a { max-height: 200px; padding-top: 10px; }
        .lp-footer-cta { background: #0f172a; padding: 72px 24px; text-align: center; }
        .lp-footer-cta h2 { font-family: 'Syne', sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #fff; margin-bottom: 14px; line-height: 1.2; }
        .lp-footer-cta p { font-size: 16px; color: #94a3b8; margin-bottom: 32px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .lp-footer { padding: 24px; text-align: center; font-size: 12px; color: var(--muted); border-top: 1px solid var(--border); }
        .lp-footer a { color: inherit; }
        @media (max-width: 640px) {
          .lp-compare-grid { grid-template-columns: 1fr; }
          .lp-mockup-body { display: none; }
          .lp-mockup-mobile { display: block; }
          .lp-nav-links { display: none; }
          .lp-proof-bar { gap: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" className="lp-nav-logo">crm<span>.</span>light</a>
        <div className="lp-nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#pricing">Tarifs</a>
          <a href="#faq">FAQ</a>
        </div>
        <Link href="/register" className="lp-nav-cta">Commencer — 9 €/mois</Link>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-badge"><span></span> CRM de relance · Pour consultants, coachs et freelances</div>
        <h1 className="lp-h1">Ne ratez plus jamais<br />une relance ou un devis</h1>
        <p className="lp-hero-sub">40% des indépendants perdent des contrats par oubli de relance. crm-light vous dit exactement qui relancer aujourd&apos;hui, en 30 secondes.</p>
        <div className="lp-hero-cta-group">
          <Link href="/register" className="lp-btn-big">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Démarrer maintenant — 9 €/mois
          </Link>
          <a href="#features" className="lp-btn-outline">Voir comment ça marche</a>
        </div>
        <p className="lp-hero-reassurance">Sans engagement · <strong>14 jours gratuits · Sans carte bancaire</strong> · Annulation en 1 clic</p>
      </section>

      {/* PROOF BAR */}
      <div className="lp-proof-bar">
        {["Aucune carte bleue pour l'essai", "Données hébergées en Europe", "Opérationnel en moins de 5 minutes", "Support humain en français"].map((item) => (
          <div key={item} className="lp-proof-item">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            {item}
          </div>
        ))}
      </div>

      {/* MOCKUP */}
      <div className="lp-mockup-section">
        <div className="lp-mockup-frame">
          <div className="lp-mockup-bar">
            <div className="lp-mockup-dot" style={{background:"#ef4444"}}></div>
            <div className="lp-mockup-dot" style={{background:"#f59e0b"}}></div>
            <div className="lp-mockup-dot" style={{background:"#10b981"}}></div>
            <div className="lp-mockup-url">app.crm.light / dashboard</div>
          </div>
          <div className="lp-mockup-body">
            <div className="lp-mock-sidebar">
              <div className="lp-mock-logo">crm<span>.</span>light</div>
              <div className="lp-mock-nav active"><div className="lp-mock-nav-ico" style={{background:"#2563eb",opacity:1,borderRadius:"3px"}}></div>Tableau de bord</div>
              <div className="lp-mock-nav"><div className="lp-mock-nav-ico"></div>Pipeline</div>
              <div className="lp-mock-nav"><div className="lp-mock-nav-ico"></div>Contacts</div>
              <div className="lp-mock-nav"><div className="lp-mock-nav-ico"></div>Relances<span style={{marginLeft:"auto",fontSize:"9px",background:"#fee2e2",color:"#dc2626",padding:"1px 5px",borderRadius:"99px",fontWeight:600}}>3</span></div>
              <div className="lp-mock-nav"><div className="lp-mock-nav-ico"></div>Devis</div>
            </div>
            <div className="lp-mock-main">
              <div className="lp-mock-topbar">
                <div className="lp-mock-title">Bonjour Thomas</div>
                <div className="lp-mock-btn">+ Nouveau contact</div>
              </div>
              <div className="lp-mock-metrics">
                <div className="lp-mock-metric"><div className="lp-mock-mlabel">Prospects actifs</div><div className="lp-mock-mval">12</div><div className="lp-mock-msub">+3 ce mois</div></div>
                <div className="lp-mock-metric"><div className="lp-mock-mlabel">Pipeline</div><div className="lp-mock-mval">38 400 €</div><div className="lp-mock-msub">+12%</div></div>
                <div className="lp-mock-metric"><div className="lp-mock-mlabel">Relances</div><div className="lp-mock-mval" style={{color:"#dc2626"}}>3</div><div className="lp-mock-msub" style={{color:"#d97706"}}>En retard</div></div>
                <div className="lp-mock-metric"><div className="lp-mock-mlabel">Gagnés</div><div className="lp-mock-mval">2</div><div className="lp-mock-msub">ce mois</div></div>
              </div>
              <div style={{fontSize:"11px",fontWeight:600,color:"#6b7280",marginBottom:"8px"}}>Pipeline</div>
              <div className="lp-mock-pipeline">
                <div>
                  <div className="lp-mock-col-title"><div className="lp-mock-col-dot" style={{background:"#9ca3af"}}></div>Prospect</div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Site e-commerce</div><div className="lp-mock-card-co">Boulangerie Martin</div><div className="lp-mock-card-amt">3 200 €</div></div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Refonte logo</div><div className="lp-mock-card-co">Studio Archi</div><div className="lp-mock-card-amt">1 500 €</div></div>
                </div>
                <div>
                  <div className="lp-mock-col-title"><div className="lp-mock-col-dot" style={{background:"#3b82f6"}}></div>En discussion</div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Audit SEO</div><div className="lp-mock-card-co">Réseau Optique</div><div className="lp-mock-card-amt">4 800 €</div></div>
                </div>
                <div>
                  <div className="lp-mock-col-title"><div className="lp-mock-col-dot" style={{background:"#f59e0b"}}></div>Devis envoyé</div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Maintenance</div><div className="lp-mock-card-co">Menuiserie F.</div><div className="lp-mock-card-amt">6 000 €</div></div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Campagne ads</div><div className="lp-mock-card-co">Clinique V.</div><div className="lp-mock-card-amt">3 500 €</div></div>
                </div>
                <div>
                  <div className="lp-mock-col-title"><div className="lp-mock-col-dot" style={{background:"#10b981"}}></div>Gagné</div>
                  <div className="lp-mock-card"><div className="lp-mock-card-name">Pack comm.</div><div className="lp-mock-card-co">Pharmacie Centrale</div><div className="lp-mock-card-amt" style={{color:"#16a34a"}}>4 200 €</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-mockup-mobile">
            <div className="lp-mockup-mobile-title">Votre pipeline en un coup d&apos;oeil</div>
            <p className="lp-mockup-mobile-text">Suivez vos prospects, vos devis et vos deals gagn&eacute;s depuis une vue claire sur mobile.</p>
            <div className="lp-mockup-mobile-pills">
              <div className="lp-mockup-mobile-pill">Prospects actifs <span>12</span></div>
              <div className="lp-mockup-mobile-pill">Pipeline <span>38 400 &euro;</span></div>
              <div className="lp-mockup-mobile-pill">Relances <span>3</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="lp-features" id="features">
        <div className="lp-section-label">Fonctionnalités</div>
        <div className="lp-section-title">Vos relances, votre pipeline, vos devis.<br />C&apos;est tout.</div>
        <p className="lp-section-sub">Chaque fonctionnalité a été choisie pour répondre à un vrai problème d&apos;indépendant. Pas de modules inutiles, pas de certifications à faire.</p>
        <div className="lp-features-grid">
          {[
            { title: "Pipeline Kanban en 30 secondes", desc: "Glissez vos prospects d'une colonne à l'autre. Votre pipeline est lisible d'un coup d'œil, sans formation préalable.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { title: "Relances automatiques", desc: "Définissez des règles simples : \"si pas de réponse après 5 jours, m'alerter\". Plus jamais un prospect qui tombe aux oubliettes.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
            { title: "Fiche contact complète", desc: "Historique des échanges, notes, deals liés. Tout ce que vous savez sur un client, au même endroit.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { title: "Tableau de bord clair", desc: "Pipeline en euros, relances en retard, deals gagnés ce mois. En 10 secondes vous savez où vous en êtes.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> },
            { title: "Devis intégrés", desc: "Créez et envoyez un devis directement depuis la fiche contact. Suivez s'il a été ouvert et relancez en un clic.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
            { title: "100% mobile-friendly", desc: "Sur chantier, en déplacement ou entre deux RDV. Ajoutez un contact ou vérifiez vos relances depuis votre téléphone.", icon: <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
          ].map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">{f.icon}</div>
              <div className="lp-feature-title">{f.title}</div>
              <div className="lp-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE */}
      <section className="lp-compare">
        <div className="lp-compare-inner">
          <div className="lp-section-label" style={{textAlign:"center"}}>Pourquoi pas HubSpot ?</div>
          <div className="lp-section-title" style={{textAlign:"center"}}>Fait pour ne plus perdre de contrats par oubli</div>
          <div className="lp-compare-grid">
            <div className="lp-compare-col bad">
              <div className="lp-compare-col-title">Agenda + post-its</div>
              {["Relances oubliées régulièrement","Prospects perdus sans s'en rendre compte","Aucune visibilité sur les devis en attente","Charge mentale permanente","Temps perdu à tout gérer manuellement"].map(item => (
                <div key={item} className="lp-compare-item"><svg className="lp-bad-ico" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{item}</div>
              ))}
            </div>
            <div className="lp-compare-col good">
              <div className="lp-compare-col-title">crm.light</div>
              {["Chaque relance rappelée au bon moment","Score chaud/tiède/froid par prospect","Devis suivis automatiquement","Dashboard clair en 10 secondes","Opérationnel en 5 minutes"].map(item => (
                <div key={item} className="lp-compare-item"><svg className="lp-good-ico" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ACCÈS ANTICIPÉ — honnête : pas de faux témoignages tant qu'il n'y a pas de vrais clients */}
      <section className="lp-testimonials">
        <div className="lp-testimonials-inner" style={{ textAlign: "center", maxWidth: "620px" }}>
          <div className="lp-section-label">Accès anticipé</div>
          <div className="lp-section-title">Les tout premiers indépendants,<br />c&apos;est maintenant</div>
          <p className="lp-section-sub" style={{ margin: "0 auto 28px" }}>
            Soyons clairs : pas de faux témoignages ici. crm-light démarre tout juste, et tu
            peux faire partie des premiers à l&apos;utiliser — ton retour oriente directement
            ce qu&apos;on construit ensuite.
          </p>
          <Link href="/register" className="lp-btn-big" style={{ margin: "0 auto" }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Rejoindre la bêta
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-pricing" id="pricing">
        <div className="lp-section-label">Tarifs</div>
        <div className="lp-section-title">Un seul plan.<br />Un seul prix.</div>
        <p className="lp-section-sub">Pas de paliers confus, pas de fonctionnalités cachées derrière un tier supérieur.</p>
        <div className="lp-pricing-card">
          <div className="lp-pricing-badge">14 jours gratuits · Sans carte bancaire</div>
          <div className="lp-pricing-plan">Plan Solo</div>
          <div className="lp-pricing-price"><sup>€</sup>9<sub>/mois</sub></div>
          <p className="lp-pricing-desc">Pour les indépendants qui veulent ne plus rater une relance ou un devis. Sans engagement, annulation en 1 clic.</p>
          <ul className="lp-pricing-features">
            {["Contacts et deals illimités","Pipeline Kanban personnalisable","Relances automatiques","Devis intégrés","Accès mobile","Hébergement Europe · RGPD","Support humain par email"].map(item => (
              <li key={item}><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{item}</li>
            ))}
          </ul>
          <Link href="/register" className="lp-pricing-cta" style={{display:"block",textAlign:"center",textDecoration:"none"}}>Essayer 14 jours gratuitement</Link>
          <p className="lp-pricing-note">Sans carte bancaire · Annulation en 1 clic · Données exportables</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq" id="faq">
        <div className="lp-section-label">Questions fréquentes</div>
        <div className="lp-section-title" style={{marginBottom:"32px"}}>Tout ce que vous<br />voulez savoir</div>
        {faqs.map((faq, i) => (
          <details key={i} className="lp-faq-item">
            <summary className="lp-faq-q">{faq.q}<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18"><polyline points="6 9 12 15 18 9"/></svg></summary>
            <div className="lp-faq-a">{faq.a}</div>
          </details>
        ))}
      </section>

      {/* FOOTER CTA */}
      <section className="lp-footer-cta">
        <h2>Votre prochain client<br />n&apos;attend pas.</h2>
        <p>14 jours gratuits, sans carte bancaire. Opérationnel en 5 minutes.</p>
        <Link href="/register" className="lp-btn-big" style={{margin:"0 auto"}}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Commencer gratuitement
        </Link>
      </section>

      <footer className="lp-footer">
        © 2026 crm-light · <Link href="/mentions-legales">Mentions légales</Link> · <Link href="/confidentialite">Politique de confidentialité</Link>
      </footer>
    </>
  );
}


