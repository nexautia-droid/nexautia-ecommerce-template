"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/dictionaries";
import { publicAsset } from "@/lib/site";
import { supabase } from "@/lib/supabase";

type ClientStatus = "trial" | "active" | "inactive";
type StoreStatus = "planning" | "building" | "published" | "paused";
type Store = {
  id: string;
  name: string;
  public_url: string | null;
  admin_url: string | null;
  github_repository: string | null;
  supabase_project_ref: string | null;
  languages: string[];
  status: StoreStatus;
};
type Client = {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  status: ClientStatus;
  notes: string | null;
  nexautia_client_stores: Store[];
};

const text = {
  es: {
    title: "Control de clientes", intro: "Gestiona las tiendas instaladas por Nexautia sin mezclar sus catálogos.", newClient: "Nuevo cliente",
    edit: "Editar", activate: "Activar", deactivate: "Desactivar", empty: "Todavía no hay clientes.", name: "Nombre del cliente",
    email: "Correo de contacto", slug: "Identificador interno", notes: "Notas internas", clientStatus: "Estado del cliente", store: "Nombre de la tienda",
    storeStatus: "Estado de la tienda", languages: "Idiomas", spanish: "Castellano", catalan: "Catalán", both: "Castellano y catalán",
    publicUrl: "Dirección pública", adminUrl: "Dirección del panel comercial", github: "Repositorio de GitHub", supabaseRef: "Referencia del proyecto Supabase",
    save: "Guardar cliente", cancel: "Cancelar", logout: "Cerrar sesión", commercial: "Panel comercial", shop: "Tienda", language: "CA",
    trial: "Prueba", active: "Activo", inactive: "Inactivo", planning: "Planificación", building: "En construcción", published: "Publicado", paused: "Pausado",
    saved: "Cliente guardado correctamente.", changed: "Estado actualizado.", loadError: "No se pudo cargar el panel central",
    authError: "No se pudo iniciar la sesión", noAccess: "Este usuario no pertenece al equipo autorizado de Nexautia.", login: "Acceso interno de Nexautia",
    password: "Contraseña", enter: "Entrar", required: "Completa al menos el nombre del cliente, su identificador y el nombre de la tienda.",
    explanation: "Crear un registro aquí no genera todavía otro Supabase: sirve para probar y organizar las futuras instalaciones.", openShop: "Abrir tienda", openAdmin: "Abrir panel",
  },
  ca: {
    title: "Control de clients", intro: "Gestiona les botigues instal·lades per Nexautia sense barrejar-ne els catàlegs.", newClient: "Client nou",
    edit: "Editar", activate: "Activar", deactivate: "Desactivar", empty: "Encara no hi ha clients.", name: "Nom del client",
    email: "Correu de contacte", slug: "Identificador intern", notes: "Notes internes", clientStatus: "Estat del client", store: "Nom de la botiga",
    storeStatus: "Estat de la botiga", languages: "Idiomes", spanish: "Castellà", catalan: "Català", both: "Castellà i català",
    publicUrl: "Adreça pública", adminUrl: "Adreça del tauler comercial", github: "Repositori de GitHub", supabaseRef: "Referència del projecte Supabase",
    save: "Desar el client", cancel: "Cancel·lar", logout: "Tancar la sessió", commercial: "Tauler comercial", shop: "Botiga", language: "ES",
    trial: "Prova", active: "Actiu", inactive: "Inactiu", planning: "Planificació", building: "En construcció", published: "Publicat", paused: "Aturat",
    saved: "Client desat correctament.", changed: "Estat actualitzat.", loadError: "No s'ha pogut carregar el tauler central",
    authError: "No s'ha pogut iniciar la sessió", noAccess: "Aquest usuari no pertany a l'equip autoritzat de Nexautia.", login: "Accés intern de Nexautia",
    password: "Contrasenya", enter: "Entrar", required: "Completa com a mínim el nom del client, l'identificador i el nom de la botiga.",
    explanation: "Crear un registre aquí encara no genera un altre Supabase: serveix per provar i organitzar les instal·lacions futures.", openShop: "Obrir botiga", openAdmin: "Obrir tauler",
  },
};

const blankForm = () => ({ id: "", storeId: "", name: "", slug: "", contactEmail: "", clientStatus: "trial" as ClientStatus, notes: "", storeName: "", storeStatus: "planning" as StoreStatus, languages: "both", publicUrl: "", adminUrl: "", githubRepository: "", supabaseProjectRef: "" });
type ClientForm = ReturnType<typeof blankForm>;

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NexautiaControlPanel({ locale }: { locale: Locale }) {
  const t = text[locale];
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<ClientForm | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadClients = useCallback(async () => {
    const result = await supabase.from("nexautia_clients").select("id,name,slug,contact_email,status,notes,nexautia_client_stores(id,name,public_url,admin_url,github_repository,supabase_project_ref,languages,status)").order("created_at");
    if (result.error) throw result.error;
    setClients((result.data ?? []) as Client[]);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const current = data.session?.user ?? null;
      setUser(current);
      if (current) {
        const { data: allowed } = await supabase.rpc("is_nexautia_operator");
        if (!active) return;
        setStaff(Boolean(allowed));
        if (allowed) await loadClients().catch((reason) => setError(`${t.loadError}: ${reason.message}`));
      }
      setLoading(false);
    }
    initialize();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadClients, t.loadError]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const result = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    if (result.error) { setError(`${t.authError}: ${result.error.message}`); setLoading(false); return; }
    const { data: allowed } = await supabase.rpc("is_nexautia_operator");
    setUser(result.data.user); setStaff(Boolean(allowed));
    if (allowed) await loadClients().catch((reason) => setError(`${t.loadError}: ${reason.message}`));
    setLoading(false);
  }

  function editClient(client?: Client) {
    if (!client) { setEditing(blankForm()); return; }
    const store = client.nexautia_client_stores[0];
    const languages = store?.languages.includes("es") && store.languages.includes("ca") ? "both" : store?.languages[0] ?? "es";
    setEditing({ id: client.id, storeId: store?.id ?? "", name: client.name, slug: client.slug, contactEmail: client.contact_email ?? "", clientStatus: client.status, notes: client.notes ?? "", storeName: store?.name ?? "", storeStatus: store?.status ?? "planning", languages, publicUrl: store?.public_url ?? "", adminUrl: store?.admin_url ?? "", githubRepository: store?.github_repository ?? "", supabaseProjectRef: store?.supabase_project_ref ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveClient(event: FormEvent) {
    event.preventDefault();
    if (!editing?.name || !editing.slug || !editing.storeName) { setError(t.required); return; }
    setError(""); setNotice("");
    const clientValues = { name: editing.name, slug: editing.slug, contact_email: editing.contactEmail || null, status: editing.clientStatus, notes: editing.notes || null };
    const clientResult = editing.id
      ? await supabase.from("nexautia_clients").update(clientValues).eq("id", editing.id).select("id").single()
      : await supabase.from("nexautia_clients").insert(clientValues).select("id").single();
    if (clientResult.error) { setError(clientResult.error.message); return; }
    const clientId = clientResult.data.id;
    const storeValues = { client_id: clientId, name: editing.storeName, status: editing.storeStatus, languages: editing.languages === "both" ? ["es", "ca"] : [editing.languages], public_url: editing.publicUrl || null, admin_url: editing.adminUrl || null, github_repository: editing.githubRepository || null, supabase_project_ref: editing.supabaseProjectRef || null };
    const storeResult = editing.storeId
      ? await supabase.from("nexautia_client_stores").update(storeValues).eq("id", editing.storeId)
      : await supabase.from("nexautia_client_stores").insert(storeValues);
    if (storeResult.error) { setError(storeResult.error.message); return; }
    await loadClients(); setEditing(null); setNotice(t.saved);
  }

  async function toggleClient(client: Client) {
    const status: ClientStatus = client.status === "inactive" ? "active" : "inactive";
    const result = await supabase.from("nexautia_clients").update({ status }).eq("id", client.id);
    if (result.error) setError(result.error.message); else { await loadClients(); setNotice(t.changed); }
  }

  if (loading) return <main className="admin-shell"><p className="control-loading">…</p></main>;
  if (!user) return <main className="admin-login"><form onSubmit={login}><Image src={publicAsset("/brand/logo.svg")} alt="Nexautia" width={150} height={48}/><p className="eyebrow">Nexautia</p><h1>{t.login}</h1><label>Email<input name="email" type="email" required autoComplete="username"/></label><label>{t.password}<input name="password" type="password" required autoComplete="current-password"/></label>{error && <p className="admin-error">{error}</p>}<button className="admin-primary">{t.enter}</button></form></main>;
  if (!staff) return <main className="admin-login"><section><h1>{t.noAccess}</h1><button className="admin-primary" onClick={() => supabase.auth.signOut().then(() => setUser(null))}>{t.logout}</button></section></main>;

  return <main className="admin-shell control-shell">
    <header className="admin-header"><Image src={publicAsset("/brand/logo.svg")} alt="Nexautia" width={135} height={43}/><div><a href={publicAsset(`/${locale}/admin/`)}>{t.commercial}</a><a href={publicAsset(`/${locale}/`)}>{t.shop}</a><a href={publicAsset(`/${locale === "es" ? "ca" : "es"}/nexautia/`)}>{t.language}</a><button onClick={() => supabase.auth.signOut().then(() => { setUser(null); setStaff(false); })}>{t.logout}</button></div></header>
    <section className="admin-content">
      <div className="admin-title"><div><p className="eyebrow">Nexautia / Control</p><h1>{t.title}</h1><p>{t.intro}</p></div>{!editing && <button className="admin-primary" onClick={() => editClient()}>{t.newClient}</button>}</div>
      <p className="control-explanation">{t.explanation}</p>
      {error && <p className="admin-error">{error}</p>}{notice && <p className="admin-notice">{notice}</p>}
      {editing ? <form className="control-form" onSubmit={saveClient}>
        <div className="form-grid">
          <label>{t.name}<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value, slug: editing.slug || slugify(event.target.value), storeName: editing.storeName || `${event.target.value} - Tienda` })} required/></label>
          <label>{t.slug}<input value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: slugify(event.target.value) })} required/></label>
          <label>{t.email}<input type="email" value={editing.contactEmail} onChange={(event) => setEditing({ ...editing, contactEmail: event.target.value })}/></label>
          <label>{t.clientStatus}<select value={editing.clientStatus} onChange={(event) => setEditing({ ...editing, clientStatus: event.target.value as ClientStatus })}><option value="trial">{t.trial}</option><option value="active">{t.active}</option><option value="inactive">{t.inactive}</option></select></label>
          <label className="wide">{t.notes}<textarea value={editing.notes} onChange={(event) => setEditing({ ...editing, notes: event.target.value })}/></label>
        </div>
        <fieldset><legend>{t.store}</legend><div className="form-grid">
          <label>{t.store}<input value={editing.storeName} onChange={(event) => setEditing({ ...editing, storeName: event.target.value })} required/></label>
          <label>{t.storeStatus}<select value={editing.storeStatus} onChange={(event) => setEditing({ ...editing, storeStatus: event.target.value as StoreStatus })}><option value="planning">{t.planning}</option><option value="building">{t.building}</option><option value="published">{t.published}</option><option value="paused">{t.paused}</option></select></label>
          <label>{t.languages}<select value={editing.languages} onChange={(event) => setEditing({ ...editing, languages: event.target.value })}><option value="both">{t.both}</option><option value="es">{t.spanish}</option><option value="ca">{t.catalan}</option></select></label>
          <label>{t.publicUrl}<input type="url" value={editing.publicUrl} onChange={(event) => setEditing({ ...editing, publicUrl: event.target.value })}/></label>
          <label>{t.adminUrl}<input type="url" value={editing.adminUrl} onChange={(event) => setEditing({ ...editing, adminUrl: event.target.value })}/></label>
          <label>{t.github}<input value={editing.githubRepository} onChange={(event) => setEditing({ ...editing, githubRepository: event.target.value })}/></label>
          <label>{t.supabaseRef}<input value={editing.supabaseProjectRef} onChange={(event) => setEditing({ ...editing, supabaseProjectRef: event.target.value })}/></label>
        </div></fieldset>
        <div className="form-actions"><button type="button" onClick={() => setEditing(null)}>{t.cancel}</button><button className="admin-primary">{t.save}</button></div>
      </form> : <section className="control-grid">{clients.length === 0 ? <p>{t.empty}</p> : clients.map((client) => { const store = client.nexautia_client_stores[0]; return <article className="control-card" key={client.id}><div><span className={`status ${client.status}`}>{t[client.status]}</span><span className="control-store-status">{store ? t[store.status] : t.planning}</span></div><h2>{client.name}</h2><p>{store?.name}</p><dl><div><dt>{t.email}</dt><dd>{client.contact_email || "—"}</dd></div><div><dt>{t.languages}</dt><dd>{store?.languages.join(" / ").toUpperCase() || "—"}</dd></div><div><dt>Supabase</dt><dd>{store?.supabase_project_ref || "—"}</dd></div></dl><div className="control-actions"><button onClick={() => editClient(client)}>{t.edit}</button><button onClick={() => toggleClient(client)}>{client.status === "inactive" ? t.activate : t.deactivate}</button>{store?.public_url && <a href={store.public_url} target="_blank" rel="noreferrer">{t.openShop} ↗</a>}{store?.admin_url && <a href={store.admin_url} target="_blank" rel="noreferrer">{t.openAdmin} ↗</a>}</div></article>; })}</section>}
    </section>
  </main>;
}
