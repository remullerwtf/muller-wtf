import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Volume2, Square, ArrowLeft, ArrowUpRight, Send,
  Bookmark, Sparkles, FileText, Check, X, Database,
  Info, Quote, ListChecks, AlertTriangle, History, Sun, Moon
} from "lucide-react";

/* ----------------------------------------------------------------
   MOCK CENTRALIZADO
   Tudo que o back-end vai preencher mora aqui. Trocar por chamadas
   de API depois e um ponto unico.
-----------------------------------------------------------------*/
const MOCK = {
  client: "Cliente Demo",
  baseVintage: "Q2/2026",
  baseDate: "31/03/2026",
  personas: [
    {
      id: "marina",
      name: "Marina",
      age: 29,
      label: "Pragmática de alto uso",
      profile: "São Paulo, decide por eficiência de tempo, preço é secundário.",
      version: "v1.2",
      nEntrevistas: 412,
      nQuanti: 3180,
      helpWith: ["rotina de deslocamento", "escolha de app", "uso de benefícios", "percepção de preço"],
      thin: ["decisão financeira de longo prazo", "investimento", "cripto", "ações", "política", "hábitos fora da capital"],
      intro: "Eu sou Marina, 29 anos, vivo em São Paulo e me desloco quase tudo por app. Fui criada a partir de 412 entrevistas e 3.180 respostas quantitativas, base de 31/03/2026.",
      exampleQs: ["Como você escolhe entre dois apps?", "O quanto o preço pesa na sua decisão?"],
      versions: [
        { version: "v1.2", date: "31/03/2026", note: "Pragmática de alto uso. Decide por eficiência de tempo, preço secundário. Incorpora dados de tarifa dinâmica do Q1." },
        { version: "v1.1", date: "31/12/2025", note: "Perfil pragmático com peso maior em preço. Antes da camada de tarifa dinâmica." },
        { version: "v1.0", date: "30/09/2025", note: "Primeira versão. Base inicial só qualitativa, sem camada quantitativa." },
      ],
    },
    {
      id: "roberto",
      name: "Roberto",
      age: 45,
      label: "Cauteloso relacional",
      profile: "Decisor de seguros da família, leal por relação, troca por dor de sinistro.",
      version: "v1.1",
      nEntrevistas: 287,
      nQuanti: 2040,
      helpWith: ["compra de seguro auto", "confiança em marca", "renovação e sinistro"],
      thin: ["investimento de risco", "cripto", "day trade", "produtos digitais novos", "política", "videogame"],
      intro: "Eu sou Roberto, 45 anos, cuido das decisões de seguro e finanças aqui de casa. Fui criado a partir de 287 entrevistas e 2.040 respostas quantitativas, base de 31/03/2026.",
      exampleQs: ["O que te faria trocar de seguradora?", "Como você decide em quem confiar?"],
      versions: [
        { version: "v1.1", date: "31/03/2026", note: "Cauteloso relacional. Leal por relação, troca por dor de sinistro." },
        { version: "v1.0", date: "31/12/2025", note: "Versão inicial centrada em preço, antes da ênfase em relação e sinistro." },
      ],
    },
    {
      id: "julia",
      name: "Júlia",
      age: 23,
      label: "Expressiva em formação",
      profile: "Primeiro emprego formal, busca autonomia, lê benefício como sinal de cultura.",
      version: "v1.0",
      nEntrevistas: 196,
      nQuanti: 1510,
      helpWith: ["uso de benefício flexível", "app de benefícios", "expectativa de empregador"],
      thin: ["aposentadoria", "financiamento", "imóvel", "crédito", "política"],
      intro: "Eu sou Júlia, 23 anos, estou no meu primeiro emprego formal. Fui criada a partir de 196 entrevistas e 1.510 respostas quantitativas, base de 31/03/2026.",
      exampleQs: ["Como você usa seu benefício?", "Você recomendaria seu empregador?"],
      versions: [
        { version: "v1.0", date: "31/03/2026", note: "Expressiva em formação. Busca autonomia no uso, lê benefício como sinal de cultura. Primeira versão." },
      ],
    },
  ],
  savedConversations: [
    { id: "c1", date: "28/05/2026", persona: "Marina", topic: "Gatilhos de troca de app", status: "registrada", stalePersona: false },
    { id: "c2", date: "26/05/2026", persona: "Roberto", topic: "Renovação de seguro auto", status: "registrada", stalePersona: true },
    { id: "c3", date: "21/05/2026", persona: "Júlia", topic: "Onboarding de benefícios", status: "descartada", stalePersona: false },
    { id: "c4", date: "19/05/2026", persona: "Marina", topic: "Sensibilidade a preço de corrida", status: "registrada", stalePersona: false },
  ],
  consentTerms:
    "Esta conversa pode ser registrada na base de conhecimento conforme o contrato vigente. O registro fica disponível para Cliente e Ilumeo, com regras de acesso distintas por papel. Nenhum registro é feito sem confirmação explícita.",
};

const REPLY_BANKS = {
  marina: [
    { match: ["preço", "preco", "caro", "valor", "custa"], grounding: "ancorado",
      text: "Preço pesa, mas não é a primeira coisa. Eu comparo dois apps por reflexo, e se a diferença é pequena eu fico no que me deixa esperando menos. Quando a tarifa dinâmica dispara, aí sim eu desisto ou troco de modal.",
      provenance: { count: "Padrão consistente em 312 das 412 entrevistas", quotes: ["Eu abro os dois e vejo qual tá mais perto e mais barato, mas se a diferença é dois real eu nem ligo.", "Quando tá aquele preço de pico eu prefiro esperar ou ir de metrô."] } },
    { match: ["escolh", "decide", "qual app", "prefere", "entre dois"], grounding: "ancorado",
      text: "Tempo de espera é o que mais me move no dia a dia. Eu tenho dois apps abertos e vou no que chega mais rápido. Marca importa pouco quando estou com pressa, importa mais quando algo dá errado.",
      provenance: { count: "Citado por 287 entrevistados", quotes: ["No corre do dia eu vou no que chega primeiro, ponto.", "Aí quando dá problema eu lembro de qual me tratou bem antes."] } },
    { match: ["fideli", "recomenda", "indicar", "leal"], grounding: "parcial",
      text: "Lealdade eu diria que existe mais por costume do que por amor à marca. Eu falaria bem de um app pra um amigo se ele nunca me deixou na mão, mas trocaria sem dó se aparecesse algo melhor. Essa parte mistura o que apareceu nas entrevistas com uma leitura mais geral, então pega com reserva.",
      provenance: { count: "Sinal parcial: 96 menções, sem consenso forte", quotes: ["Eu recomendo, mas se vier outro melhor eu pulo fora."] } },
  ],
  roberto: [
    { match: ["troca", "trocar", "muda", "sair"], grounding: "ancorado",
      text: "Eu troco de seguradora por dor, não por preço. Um sinistro mal resolvido vale mais que qualquer desconto. Se a renovação subir muito sem motivo claro eu cogito, mas a primeira coisa que penso é como eles me trataram quando precisei.",
      provenance: { count: "Tema dominante em 241 entrevistas", quotes: ["Preço me irrita, mas o que me faz sair mesmo é ter passado raiva num sinistro.", "Se na hora do aperto eles aparecem, eu pago um pouco mais sem reclamar."] } },
    { match: ["confia", "marca", "reputa", "segura"], grounding: "ancorado",
      text: "Confiança pra mim é histórico, não propaganda. Eu olho se a empresa é antiga, se alguém que conheço já usou e se o corretor me dá segurança. Marca nova tem que provar muito mais antes de eu colocar o carro da família nela.",
      provenance: { count: "Citado por 198 entrevistados", quotes: ["Empresa que tá há anos no mercado já me passa mais tranquilidade.", "Meu corretor é quem segura a relação, sinceramente."] } },
  ],
  julia: [
    { match: ["usa", "benefício", "beneficio", "gasta", "flexí"], grounding: "ancorado",
      text: "Eu uso quase tudo em comida e mercado, e adoro poder escolher onde gastar. A flexibilidade é o que me faz sentir que a empresa confia em mim. Quando o benefício é travado num lugar só, parece que estão me tratando como criança.",
      provenance: { count: "Padrão forte em 168 das 196 entrevistas", quotes: ["Poder decidir onde usar é o que mais me agrada.", "Benefício engessado dá uma sensação ruim, tipo desconfiança."] } },
    { match: ["recomenda", "empregador", "empresa", "indicar"], grounding: "parcial",
      text: "Eu recomendaria a empresa mais pela cultura do que pelo benefício em si, mas confesso que o benefício é o primeiro sinal que eu leio sobre como ela trata a gente. Essa ligação entre benefício e cultura é uma leitura minha por cima do que apareceu, então trate como hipótese.",
      provenance: { count: "Sinal parcial: associação sugerida, não medida diretamente", quotes: ["O benefício é o primeiro recado que a empresa te dá."] } },
  ],
};

const LEADING_PATTERNS = [
  "não é mesmo", "nao e mesmo", "você concorda", "voce concorda", "concorda que",
  "obviamente", "com certeza você", "com certeza voce", "não acha que", "nao acha que",
  "todo mundo", "claramente", "né?", "ne?", "imagino que você", "imagino que voce",
];

const GROUNDING = {
  ancorado: { label: "Ancorado em dado", dot: "solid", desc: "Resposta sustentada por padrão consistente na base." },
  parcial: { label: "Sinal parcial", dot: "ring", desc: "Sustentação parcial. Há indício, mas sem consenso forte." },
  extrapolacao: { label: "Extrapolação", dot: "hollow", desc: "Vai além do que a base cobre. Leitura aproximada do modelo." },
};

function isLeading(text) {
  const t = text.toLowerCase();
  return LEADING_PATTERNS.some((p) => t.includes(p));
}

function getReply(persona, text) {
  const t = text.toLowerCase();
  if ((persona.thin || []).some((k) => t.includes(k))) {
    return { outOfScope: true, grounding: null,
      text: "Isso está fora do que a minha base cobre. Eu fui criada a partir de pesquisa sobre assuntos específicos, e responder isso seria inventar. Prefiro dizer que não sei a te dar uma resposta sem lastro.",
      provenance: null };
  }
  const bank = REPLY_BANKS[persona.id] || [];
  const hit = bank.find((r) => r.match.some((k) => t.includes(k)));
  if (hit) return { outOfScope: false, ...hit };
  return { outOfScope: false, grounding: "extrapolacao",
    text: "Não tenho um padrão direto na base pra isso, então vou te dar uma leitura aproximada e já sinalizo que é extrapolação. Pelo conjunto do que apareceu, eu imagino que reagiria com cautela, mas confirme essa parte com dado real antes de usar.",
    provenance: { count: "Sem ancoragem direta. Leitura inferida do modelo.", quotes: [] } };
}

/* ---------------------------------------------------------------- */

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');
.ps-root *{box-sizing:border-box;}
.ps-root{font-family:'Raleway',sans-serif; color:var(--ink); background:var(--bg); min-height:100%; transition:background .25s ease,color .25s ease;}
.ps-root.light{--bg:#FFFFFF; --surface:#FFFFFF; --surface2:#F6F5F2; --line:#E7E4DE; --ink:#1A1A1A; --ink2:#7A7A7A; --accent:#FF9100;}
.ps-root.dark{--bg:#0A0A0A; --surface:#151515; --surface2:#1C1C1C; --line:#2B2B2B; --ink:#FFFFFF; --ink2:#9A9A9A; --accent:#FF9100;}
.ps-thin{font-weight:200; letter-spacing:.04em;}
.ps-card{background:var(--surface); border:1px solid var(--line); border-radius:12px;}
.ps-btn{font-family:'Raleway',sans-serif; cursor:pointer; border:none; transition:all .15s ease;}
.ps-btn:hover{transform:translateY(-1px);}
.ps-link{cursor:pointer; transition:opacity .15s ease;}
.ps-link:hover{opacity:.6;}
.ps-fade{animation:psFade .35s ease both;}
@keyframes psFade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
.ps-root textarea{font-family:'Raleway',sans-serif; resize:none; outline:none; background:transparent; color:var(--ink);}
`;

function LogoMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <rect x="2" y="5" width="14" height="2" rx="1" fill="var(--accent)" />
      <rect x="2" y="9.5" width="20" height="2" rx="1" fill="var(--accent)" />
      <rect x="2" y="14" width="9" height="2" rx="1" fill="var(--accent)" />
      <rect x="2" y="18" width="16" height="2" rx="1" fill="var(--accent)" />
    </svg>
  );
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <LogoMark />
      <span className="ps-thin" style={{ fontSize: 16, letterSpacing: ".28em", color: "var(--ink2)" }}>ILUMEO</span>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid var(--line)", textAlign: "center", fontSize: 10, letterSpacing: ".14em", color: "var(--ink2)" }}>
      INTELIGÊNCIA DE DADOS PARA MARKETING <span style={{ borderBottom: "1px solid var(--accent)", color: "var(--ink)" }}>EFFECTIVENESS</span>
    </div>
  );
}

function Badge({ children, accent }) {
  return (
    <span style={{ color: accent ? "var(--accent)" : "var(--ink2)", background: accent ? "rgba(255,145,0,0.10)" : "var(--surface2)", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>
  );
}

function SyntheticBadge() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,145,0,0.10)", color: "var(--accent)", padding: "5px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600 }}>
      <ShieldCheck size={13} /> Persona sintética. Representação de pesquisa, não uma pessoa.
    </div>
  );
}

function Dot({ kind }) {
  if (kind === "solid") return <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--ink)" }} />;
  if (kind === "ring") return <span style={{ width: 7, height: 7, borderRadius: 999, border: "2px solid var(--ink2)" }} />;
  return <span style={{ width: 7, height: 7, borderRadius: 999, border: "1.5px dashed var(--ink2)" }} />;
}

function GroundingTag({ level, onInfo }) {
  if (!level) return null;
  const g = GROUNDING[level];
  return (
    <button className="ps-btn" onClick={onInfo} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface2)", color: "var(--ink2)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
      <Dot kind={g.dot} /> {g.label}
    </button>
  );
}

/* ---------------------------------------------------------------- */

export default function App() {
  const [theme, setTheme] = useState("light");
  const [screen, setScreen] = useState("dashboard");
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [provocacao, setProvocacao] = useState(false);
  const [openProv, setOpenProv] = useState({});
  const [groundingInfo, setGroundingInfo] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [vintageOpen, setVintageOpen] = useState(false);
  const [clips, setClips] = useState([]);
  const [saveModal, setSaveModal] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [versionsFor, setVersionsFor] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, openProv]);

  function openConversation(p) {
    setPersona(p); setMessages([]); setInput(""); setProvocacao(false);
    setOpenProv({}); setClips([]); setVintageOpen(false); setScreen("conversation");
  }

  function send(textArg) {
    const value = (textArg != null ? textArg : input);
    if (!value.trim()) return;
    const leading = isLeading(value);
    const userMsg = { id: "u" + Date.now(), role: "client", text: value, leading };
    const reply = getReply(persona, value);
    let text = reply.text;
    if (leading && !reply.outOfScope) text = "Percebo que a pergunta já sugere uma resposta. Vou responder de forma neutra, sem te dar só o que parece que você quer ouvir. " + text;
    if (provocacao && !reply.outOfScope) text = "Em modo provocação, testando a robustez do que eu disse: " + text + " Mas, olhando pelo avesso, é possível que eu esteja racionalizando um hábito mais do que uma escolha consciente.";
    const personaMsg = { id: "p" + Date.now(), role: "persona", ...reply, text };
    setMessages((m) => [...m, userMsg, personaMsg]);
    setInput("");
  }

  function speak(id, text) {
    if (!window.speechSynthesis) return;
    if (playingId === id) { window.speechSynthesis.cancel(); setPlayingId(null); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "pt-BR";
    const v = window.speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith("pt"));
    if (v) u.voice = v;
    u.onend = () => setPlayingId(null);
    setPlayingId(id); window.speechSynthesis.speak(u);
  }

  function clip(msg) { setClips((c) => c.find((x) => x.id === msg.id) ? c : [...c, { id: msg.id, text: msg.text }]); }

  const personaMsgs = messages.filter((m) => m.role === "persona");

  function ThemeToggle() {
    return (
      <button className="ps-btn" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        style={{ background: "var(--surface2)", color: "var(--ink2)", width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
      </button>
    );
  }

  return (
    <div className={"ps-root " + theme} style={{ width: "100%", minHeight: "100vh" }}>
      <style>{STYLE}</style>
      <div style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "26px 22px 60px" }}>

        {/* ====================== DASHBOARD ====================== */}
        {screen === "dashboard" && (
          <div className="ps-fade">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <Wordmark />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink2)", fontSize: 12.5 }}><Database size={14} /> Base {MOCK.baseVintage}</span>
                <ThemeToggle />
              </div>
            </div>

            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent)", letterSpacing: ".12em" }}>{MOCK.client}</div>
              <h1 className="ps-thin" style={{ fontSize: 46, margin: "6px 0 0", lineHeight: 1, textTransform: "uppercase" }}>
                Persona <span style={{ color: "var(--accent)" }}>sintética</span>
              </h1>
              <p style={{ fontSize: 14, color: "var(--ink2)", marginTop: 10, maxWidth: 560, lineHeight: 1.5 }}>
                Cada persona é a representação interativa de um estudo de pesquisa validado, atualizada a cada trimestre. Converse com ela como faria numa entrevista em profundidade.
              </p>
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink2)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>Personas disponíveis</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 14, marginBottom: 36 }}>
              {MOCK.personas.map((p) => (
                <div key={p.id} className="ps-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div className="ps-thin" style={{ fontSize: 26, lineHeight: 1 }}>{p.name}, {p.age}</div>
                      <button className="ps-link ps-btn" onClick={() => setVersionsFor(p)} title="Ver versões anteriores"
                        style={{ background: "none", color: "var(--ink2)", fontSize: 11, display: "flex", alignItems: "center", gap: 3, padding: 0 }}>
                        <History size={12} /> {p.version}
                      </button>
                    </div>
                    <div style={{ marginTop: 6 }}><Badge accent>{p.label}</Badge></div>
                    <div style={{ fontSize: 12.5, color: "var(--ink2)", marginTop: 8, lineHeight: 1.4 }}>{p.profile}</div>
                  </div>
                  <button className="ps-btn" onClick={() => openConversation(p)}
                    style={{ background: "var(--accent)", color: "#fff", padding: "9px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    Nova conversa <ArrowUpRight size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink2)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>Conversas registradas</div>
            <div className="ps-card" style={{ overflow: "hidden" }}>
              {MOCK.savedConversations.map((c, i) => {
                const p = MOCK.personas.find((x) => x.name === c.persona);
                return (
                  <div key={c.id} className="ps-link" onClick={() => p && openConversation(p)} title="Abre uma nova conversa com esta persona"
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div style={{ fontSize: 12, color: "var(--ink2)", width: 78 }}>{c.date}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.topic}</div>
                      <div style={{ fontSize: 12, color: "var(--ink2)" }}>
                        {c.persona}{c.stalePersona && <span style={{ color: "var(--accent)", marginLeft: 8 }}>versão anterior da base</span>}
                      </div>
                    </div>
                    <Badge accent={c.status === "registrada"}>{c.status}</Badge>
                  </div>
                );
              })}
            </div>
            <Footer />
          </div>
        )}

        {/* ====================== CONVERSATION ====================== */}
        {screen === "conversation" && persona && (
          <div className="ps-fade" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 40px)" }}>
            {/* top controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <button className="ps-link ps-btn" onClick={() => { window.speechSynthesis && window.speechSynthesis.cancel(); setScreen("dashboard"); }}
                style={{ background: "none", display: "flex", alignItems: "center", gap: 5, color: "var(--ink2)", fontSize: 13, fontWeight: 500, padding: 0 }}>
                <ArrowLeft size={15} /> Dashboard
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ position: "relative" }}>
                <button className="ps-btn" onClick={() => setVintageOpen((v) => !v)}
                  style={{ background: "var(--surface2)", color: "var(--ink2)", fontSize: 11.5, padding: "5px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                  <Database size={12} /> {MOCK.baseVintage}
                </button>
                {vintageOpen && (
                  <div className="ps-fade ps-card" style={{ position: "absolute", right: 0, top: 32, padding: 12, width: 230, zIndex: 5, fontSize: 12, color: "var(--ink2)" }}>
                    Base de <strong style={{ color: "var(--ink)" }}>{MOCK.baseDate}</strong>. Persona <strong style={{ color: "var(--ink)" }}>{persona.version}</strong>. Atualização trimestral.
                  </div>
                )}
              </div>
              <button className="ps-btn" onClick={() => setVersionsFor(persona)}
                style={{ background: "var(--surface2)", color: "var(--ink2)", fontSize: 11.5, padding: "5px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                <History size={12} /> Versões
              </button>
              <ThemeToggle />
            </div>

            {/* persona header (substitui a tela de transição) */}
            <div className="ps-card" style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <div className="ps-thin" style={{ fontSize: 30, lineHeight: 1 }}>{persona.name}, {persona.age}</div>
                <Badge accent>{persona.label}</Badge>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--ink2)", lineHeight: 1.55, marginTop: 10 }}>{persona.intro}</p>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 8 }}>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>Posso te ajudar com:</span> {persona.helpWith.join(", ")}.
              </p>
              <div style={{ marginTop: 12 }}><SyntheticBadge /></div>
            </div>

            {/* thread */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "6px 2px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.length === 0 && (
                <div style={{ margin: "auto", textAlign: "center", maxWidth: 380 }}>
                  <div style={{ fontSize: 13.5, color: "var(--ink2)", marginBottom: 14 }}>Faça a primeira pergunta a {persona.name}.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {persona.exampleQs.map((q) => (
                      <button key={q} className="ps-btn" onClick={() => send(q)}
                        style={{ background: "var(--surface2)", color: "var(--ink)", fontSize: 13, padding: "9px 13px", borderRadius: 999 }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => {
                if (m.role === "client")
                  return (
                    <div key={m.id} style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
                      <div style={{ background: "var(--ink)", color: "var(--bg)", padding: "11px 14px", borderRadius: "14px 14px 4px 14px", fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                      {m.leading && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--accent)", marginTop: 5, justifyContent: "flex-end" }}>
                          <Info size={12} /> Pergunta indutora detectada. A persona responde de forma neutra.
                        </div>
                      )}
                    </div>
                  );
                return (
                  <div key={m.id} style={{ alignSelf: "flex-start", maxWidth: "84%" }}>
                    <div className="ps-card" style={{ padding: "13px 15px", borderRadius: "14px 14px 14px 4px", background: m.outOfScope ? "var(--surface2)" : "var(--surface)" }}>
                      {m.outOfScope && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink2)", fontWeight: 600, marginBottom: 6 }}>
                          <Info size={13} /> Fora de escopo
                        </div>
                      )}
                      <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{m.text}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11, flexWrap: "wrap" }}>
                        {m.grounding && <GroundingTag level={m.grounding} onInfo={() => setGroundingInfo(m.grounding)} />}
                        {m.provenance && (
                          <button className="ps-btn" onClick={() => setOpenProv((o) => ({ ...o, [m.id]: !o[m.id] }))}
                            style={{ background: "none", color: "var(--accent)", fontSize: 11.5, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                            <Quote size={12} /> Ver de onde vem
                          </button>
                        )}
                        <button className="ps-btn" onClick={() => speak(m.id, m.text)}
                          style={{ background: "none", color: playingId === m.id ? "var(--accent)" : "var(--ink2)", fontSize: 11.5, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                          {playingId === m.id ? <Square size={12} /> : <Volume2 size={13} />}
                        </button>
                        <button className="ps-btn" onClick={() => clip(m)}
                          style={{ background: "none", color: clips.find((c) => c.id === m.id) ? "var(--accent)" : "var(--ink2)", fontSize: 11.5, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                          <Bookmark size={12} /> {clips.find((c) => c.id === m.id) ? "Salvo" : "Salvar trecho"}
                        </button>
                      </div>
                      {openProv[m.id] && m.provenance && (
                        <div className="ps-fade" style={{ marginTop: 11, paddingTop: 11, borderTop: "1px dashed var(--line)" }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink2)", marginBottom: 7 }}>{m.provenance.count}</div>
                          {m.provenance.quotes.length === 0 && <div style={{ fontSize: 12.5, color: "var(--ink2)", fontStyle: "italic" }}>Sem verbatims diretos. Resposta inferida, não citada.</div>}
                          {m.provenance.quotes.map((q, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "var(--ink2)", fontStyle: "italic", padding: "4px 0 4px 10px", borderLeft: "2px solid var(--accent)", marginBottom: 5 }}>"{q}"</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {personaMsgs.length > 0 && (
              <div style={{ display: "flex", gap: 8, padding: "8px 0", flexWrap: "wrap" }}>
                <button className="ps-btn" onClick={() => setProvocacao((v) => !v)}
                  style={{ background: provocacao ? "rgba(255,145,0,0.14)" : "var(--surface2)", color: provocacao ? "var(--accent)" : "var(--ink2)", fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                  <Sparkles size={13} /> Modo provocação {provocacao ? "ligado" : "desligado"}
                </button>
                <button className="ps-btn" onClick={() => setSummaryOpen(true)}
                  style={{ background: "var(--surface2)", color: "var(--ink)", fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                  <FileText size={13} /> Gerar resumo
                </button>
                <button className="ps-btn" onClick={() => setSaveModal(true)}
                  style={{ background: "var(--surface2)", color: "var(--ink)", fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                  <ListChecks size={13} /> Salvar ou descartar {clips.length > 0 && `(${clips.length})`}
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`Pergunte algo a ${persona.name}...`}
                style={{ flex: 1, minHeight: 46, maxHeight: 120, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 14, lineHeight: 1.4 }} />
              <button className="ps-btn" onClick={() => send()}
                style={{ background: "var(--accent)", color: "#fff", width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ====================== MODALS ====================== */}
        {versionsFor && (
          <Overlay onClose={() => setVersionsFor(null)}>
            <div className="ps-thin" style={{ fontSize: 24 }}>{versionsFor.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink2)", marginBottom: 14 }}>Histórico de versões. Leitura da descrição, sem conversar.</div>
            {versionsFor.versions.map((v, i) => (
              <div key={v.version} style={{ padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge accent={i === 0}>{v.version}</Badge>
                  <span style={{ fontSize: 12, color: "var(--ink2)" }}>{v.date}</span>
                  {i === 0 && <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>atual</span>}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, color: i === 0 ? "var(--ink)" : "var(--ink2)" }}>{v.note}</div>
              </div>
            ))}
          </Overlay>
        )}

        {groundingInfo && (
          <Overlay onClose={() => setGroundingInfo(null)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Dot kind={GROUNDING[groundingInfo].dot} />
              <div className="ps-thin" style={{ fontSize: 20 }}>{GROUNDING[groundingInfo].label}</div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink2)" }}>{GROUNDING[groundingInfo].desc}</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)", marginTop: 10, fontStyle: "italic" }}>
              Este sinal é renderizado pela interface, mas calculado pelo back-end. Aqui está mockado para demonstrar onde aparece.
            </p>
          </Overlay>
        )}

        {summaryOpen && (
          <Overlay onClose={() => setSummaryOpen(false)}>
            <div className="ps-thin" style={{ fontSize: 22 }}>Resumo da conversa</div>
            <div style={{ fontSize: 11.5, color: "var(--ink2)", marginBottom: 14 }}>{persona.name} {persona.version}, base de {MOCK.baseDate}</div>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              A conversa percorreu {personaMsgs.length} resposta{personaMsgs.length > 1 ? "s" : ""} de {persona.name}.
              {personaMsgs.some((m) => m.grounding === "extrapolacao" || m.outOfScope)
                ? " Parte do material veio com sinal fraco ou fora de escopo, marcado abaixo para você tratar com reserva."
                : " O conjunto ficou majoritariamente ancorado em dado."}
            </p>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink2)", margin: "16px 0 8px", letterSpacing: ".08em", textTransform: "uppercase" }}>Reel de citações</div>
            {personaMsgs.length === 0 && <div style={{ fontSize: 13, color: "var(--ink2)" }}>Sem respostas ainda.</div>}
            {personaMsgs.map((m) => (
              <div key={m.id} style={{ display: "flex", gap: 8, padding: "8px 0", borderTop: "1px solid var(--line)", alignItems: "flex-start" }}>
                <div style={{ marginTop: 3 }}>{m.grounding ? <GroundingTag level={m.grounding} onInfo={() => {}} /> : <Badge>fora de escopo</Badge>}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
              </div>
            ))}
          </Overlay>
        )}

        {saveModal && <SaveModal persona={persona} clips={clips} onClose={() => setSaveModal(false)} />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 20 }}>
      <div className="ps-card ps-fade" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, width: "100%", maxHeight: "82vh", overflowY: "auto", padding: 24, position: "relative" }}>
        <button className="ps-btn" onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "var(--surface2)", borderRadius: 999, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}><X size={15} /></button>
        {children}
      </div>
    </div>
  );
}

function SaveModal({ persona, clips, onClose }) {
  const [configured, setConfigured] = useState(true);
  const [target, setTarget] = useState("ambos");
  const [stage, setStage] = useState("choose");
  return (
    <Overlay onClose={onClose}>
      {stage === "done" && (
        <div className="ps-fade" style={{ textAlign: "center", padding: "10px 0" }}>
          <Check size={34} color="var(--accent)" />
          <div className="ps-thin" style={{ fontSize: 22, marginTop: 8 }}>Registrada</div>
          <p style={{ fontSize: 13.5, color: "var(--ink2)", marginTop: 8, lineHeight: 1.55 }}>
            Carimbada com persona {persona.version} e base de {MOCK.baseDate}. Destino: {target === "ambos" ? "Cliente e Ilumeo" : target === "cliente" ? "Cliente" : "Ilumeo"}.
            {clips.length > 0 && ` ${clips.length} trecho(s) incluído(s).`}
          </p>
        </div>
      )}
      {stage === "discarded" && (
        <div className="ps-fade" style={{ textAlign: "center", padding: "10px 0" }}>
          <X size={34} color="var(--ink2)" />
          <div className="ps-thin" style={{ fontSize: 22, marginTop: 8 }}>Descartada</div>
          <p style={{ fontSize: 13.5, color: "var(--ink2)", marginTop: 8 }}>Nada foi registrado na base de conhecimento.</p>
        </div>
      )}
      {(stage === "choose" || stage === "confirm") && (
        <>
          <div className="ps-thin" style={{ fontSize: 22, marginBottom: 10 }}>Registrar ou descartar</div>
          <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 13, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink2)", marginBottom: 14 }}>{MOCK.consentTerms}</div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={configured} onChange={(e) => setConfigured(e.target.checked)} /> Acordo de uso e posse configurado no contrato
          </label>
          {!configured && (
            <div className="ps-fade" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--accent)", background: "rgba(255,145,0,0.12)", padding: 11, borderRadius: 10, marginBottom: 14 }}>
              <AlertTriangle size={15} /> Acordo não configurado. Registro bloqueado até o contrato definir a posse do dado.
            </div>
          )}
          {configured && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink2)", marginBottom: 7 }}>Destino do registro</div>
              <div style={{ display: "flex", gap: 7 }}>
                {[["cliente", "Cliente"], ["ilumeo", "Ilumeo"], ["ambos", "Ambos"]].map(([k, t]) => (
                  <button key={k} className="ps-btn" onClick={() => setTarget(k)}
                    style={{ flex: 1, padding: "8px 6px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, border: target === k ? "1.5px solid var(--accent)" : "1px solid var(--line)", background: target === k ? "rgba(255,145,0,0.08)" : "var(--surface)", color: "var(--ink)" }}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {stage === "confirm" && configured ? (
            <div className="ps-fade">
              <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 10 }}>Confirmar o registro desta conversa na base?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="ps-btn" onClick={() => setStage("choose")} style={{ flex: 1, padding: 11, borderRadius: 10, background: "var(--surface2)", color: "var(--ink)", fontSize: 13.5, fontWeight: 600 }}>Voltar</button>
                <button className="ps-btn" onClick={() => setStage("done")} style={{ flex: 1, padding: 11, borderRadius: 10, background: "var(--accent)", color: "#fff", fontSize: 13.5, fontWeight: 600 }}>Confirmar registro</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ps-btn" onClick={() => setStage("discarded")} style={{ flex: 1, padding: 12, borderRadius: 10, background: "var(--surface2)", color: "var(--ink)", fontSize: 13.5, fontWeight: 600 }}>Descartar</button>
              <button className="ps-btn" disabled={!configured} onClick={() => setStage("confirm")}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: configured ? "var(--accent)" : "var(--line)", color: configured ? "#fff" : "var(--ink2)", fontSize: 13.5, fontWeight: 600, cursor: configured ? "pointer" : "not-allowed" }}>Registrar na base</button>
            </div>
          )}
        </>
      )}
    </Overlay>
  );
}
