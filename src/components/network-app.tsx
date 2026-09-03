"use client";

/* eslint-disable react-hooks/incompatible-library -- TanStack Table and React Hook Form expose intentionally non-memoizable APIs. */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  CalendarPlus,
  LoaderCircle,
  LogOut,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFormSchema,
  emptyContactForm,
  type ContactFormValues,
} from "@/lib/contact-schema";
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
} from "@/lib/contacts";
import { isNeonConfigured, neon } from "@/lib/neon";
import { cn } from "@/lib/utils";
import type { Contact, Priority } from "@/types/contact";

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: new Date(value).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(new Date(value));
}

function valuesFromContact(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    company: contact.company ?? "",
    role: contact.role ?? "",
    where_met: contact.where_met ?? "",
    notes: contact.notes ?? "",
    priority: contact.priority,
  };
}

export function NetworkApp() {
  if (!isNeonConfigured || !neon) return <SetupPreview />;
  return <AuthenticatedNetworkApp />;
}

function AuthenticatedNetworkApp() {
  const session = neon!.auth.useSession();

  if (session.isPending) return <SessionLoading />;
  if (!session.data?.user) return <SignedOutHome />;

  return (
    <ContactsWorkspace
      user={{
        name: session.data.user.name ?? "Your network",
        email: session.data.user.email,
      }}
    />
  );
}

function SessionLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading font-semibold">Opening your network</p>
          <p className="mt-1 text-sm text-muted-foreground">Checking your secure session…</p>
        </div>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    </main>
  );
}

function SignedOutHome() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <Link href="/auth/sign-in" className={cn(buttonVariants({ variant: "ghost" }), "rounded-xl px-4")}>Sign in</Link>
        </div>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
        <div>
          <Badge variant="secondary" className="rounded-full px-3 py-1"><ShieldCheck className="size-3.5" />Private by design</Badge>
          <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">Your network,<br /><span className="text-primary/68">thoughtfully kept.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Remember where you met, what matters to them, and who deserves a thoughtful follow-up—without handing your contacts to anyone else.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-xl px-5")}><UserRoundPlus className="size-4" />Create your account</Link>
            <Link href="/auth/sign-in" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-xl px-5")}>I already have an account</Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" />Each account can access only its own contacts.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-accent/25 blur-3xl" />
          <div className="overflow-hidden rounded-3xl border bg-card shadow-[0_30px_80px_rgba(18,38,63,.13)]">
            <div className="flex items-center justify-between border-b p-4"><div><p className="text-sm font-semibold">People to remember</p><p className="text-xs text-muted-foreground">A clear view of every connection</p></div><Button size="icon-sm" aria-label="Add contact"><Plus /></Button></div>
            {[{ n: "Maya Chen", r: "Product Designer · SkyDeck", p: "high" }, { n: "Jordan Patel", r: "MBA Candidate · Haas", p: "medium" }, { n: "Sofia Rodriguez", r: "Research Assistant · BAIR", p: "low" }].map((person) => (
              <div key={person.n} className="flex items-center gap-3 border-b p-4 last:border-0"><div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">{getInitials(person.n)}</div><div className="min-w-0 flex-1"><p className="font-medium">{person.n}</p><p className="truncate text-xs text-muted-foreground">{person.r}</p></div><Badge data-priority={person.p} className="priority-badge rounded-full capitalize">{person.p}</Badge></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SetupPreview() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand /><Badge variant="secondary" className="rounded-full">Preview mode</Badge></div></header>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-accent/60 bg-accent/15 p-4 text-sm"><strong>Connect Neon to activate the app.</strong> Copy <code>.env.example</code> to <code>.env.local</code> and add the two public endpoint values. The product preview below uses sample contacts only.</div>
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><Badge variant="secondary" className="mb-3 rounded-full px-3 py-1"><Users className="size-3.5" />3 people in your circle</Badge><h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your network, thoughtfully kept.</h1><p className="mt-2 text-muted-foreground">Keep the context that matters and make every follow-up feel natural.</p></div><Button size="lg" className="h-10 rounded-xl"><Plus />Add contact</Button></div>
        <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-[0_10px_40px_rgba(18,38,63,.06)]"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:justify-between"><div className="relative sm:max-w-sm sm:flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="h-10 rounded-xl pl-9" placeholder="Search people, companies, or places" /></div><Button variant="outline" className="h-10 rounded-xl"><ArrowUpDown />Recently updated</Button></div>{[{ name: "Maya Chen", role: "Product Designer · Berkeley SkyDeck", met: "AI Builders Meetup", priority: "high" }, { name: "Jordan Patel", role: "MBA Candidate · Haas", met: "Coffee chat at Café Strada", priority: "medium" }, { name: "Sofia Rodriguez", role: "Research Assistant · BAIR", met: "Responsible AI seminar", priority: "low" }].map((person) => <div key={person.name} className="flex items-center gap-4 border-b p-4 last:border-0"><div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">{getInitials(person.name)}</div><div className="min-w-0 flex-1"><p className="font-medium">{person.name}</p><p className="truncate text-xs text-muted-foreground">{person.role}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{person.met}</p></div><Badge data-priority={person.priority} className="priority-badge rounded-full capitalize">{person.priority}</Badge></div>)}</div>
      </section>
    </main>
  );
}

function Brand() {
  return <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="size-4" /></div><div><p className="font-heading text-sm font-semibold tracking-tight">Berkonnect</p><p className="text-xs text-muted-foreground">Stay meaningfully connected</p></div></div>;
}

function ContactsWorkspace({ user }: { user: { name: string; email: string } }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "updated_at", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const contactsQuery = useQuery({ queryKey: ["contacts"], queryFn: listContacts });
  const contacts = contactsQuery.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const columns = useMemo<ColumnDef<Contact>[]>(() => [
    { accessorKey: "name", header: "Person", cell: ({ row }) => <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">{getInitials(row.original.name)}</div><div className="min-w-0"><p className="font-medium">{row.original.name}</p><p className="max-w-[18rem] truncate text-xs text-muted-foreground">{[row.original.role, row.original.company].filter(Boolean).join(" · ") || "No role added"}</p></div></div> },
    { accessorKey: "where_met", header: "Where you met", cell: ({ getValue }) => <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{(getValue() as string | null) || "Not added"}</span> },
    { accessorKey: "priority", header: "Priority", filterFn: "equals", sortingFn: (a, b) => priorityRank[a.original.priority] - priorityRank[b.original.priority], cell: ({ getValue }) => <Badge data-priority={getValue()} className="priority-badge rounded-full capitalize">{getValue() as string}</Badge> },
    { accessorKey: "created_at", header: "Created" },
    { accessorKey: "updated_at", header: "Updated", cell: ({ getValue }) => <span className="text-xs text-muted-foreground">{formatDate(getValue() as string)}</span> },
    { id: "actions", enableSorting: false, cell: ({ row }) => <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingContact(row.original); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ], []);

  const table = useReactTable({
    data: contacts,
    columns,
    state: { globalFilter: search, sorting, columnFilters },
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const needle = String(filterValue).trim().toLowerCase();
      if (!needle) return true;
      return [row.original.name, row.original.company, row.original.role, row.original.where_met, row.original.notes].filter(Boolean).join(" ").toLowerCase().includes(needle);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    table.getColumn("priority")?.setFilterValue(priority === "all" ? undefined : priority);
  }, [priority, table]);

  const highPriority = contacts.filter((contact) => contact.priority === "high").length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const addedThisMonth = contacts.filter((contact) => { const date = new Date(contact.created_at); return date.getMonth() === currentMonth && date.getFullYear() === currentYear; }).length;
  const places = new Set(contacts.map((contact) => contact.where_met?.trim()).filter(Boolean)).size;

  async function handleSignOut() {
    setSigningOut(true);
    try { await neon!.auth.signOut(); toast.success("Signed out"); }
    catch { toast.error("Could not sign out. Please try again."); }
    finally { setSigningOut(false); }
  }

  function setSort(value: string | null) {
    if (value === "name") setSorting([{ id: "name", desc: false }]);
    else if (value === "priority") setSorting([{ id: "priority", desc: false }]);
    else if (value === "created") setSorting([{ id: "created_at", desc: true }]);
    else setSorting([{ id: "updated_at", desc: true }]);
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-lg"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Brand /><div className="flex items-center gap-2"><div className="hidden text-right sm:block"><p className="max-w-48 truncate text-xs font-medium">{user.name}</p><p className="max-w-48 truncate text-[11px] text-muted-foreground">{user.email}</p></div><div className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">{getInitials(user.name || user.email)}</div><Button variant="ghost" size="icon" onClick={handleSignOut} disabled={signingOut} aria-label="Sign out">{signingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}</Button></div></div></header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><Badge variant="secondary" className="mb-3 rounded-full px-3 py-1"><Users className="size-3.5" />{contacts.length} {contacts.length === 1 ? "person" : "people"} in your circle</Badge><h1 className="font-heading text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Your network, thoughtfully kept.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Keep the context that matters, find anyone quickly, and make your next conversation feel natural.</p></div><Button size="lg" className="h-10 rounded-xl px-4" onClick={() => { setEditingContact(null); setFormOpen(true); }}><Plus />Add contact</Button></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3"><Stat label="High priority" value={highPriority} detail="Worth a thoughtful follow-up" /><Stat label="Added this month" value={addedThisMonth} detail="Your circle is growing" /><Stat label="Places connected" value={places} detail="Across campus and beyond" /></div>
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-[0_10px_40px_rgba(18,38,63,.06)]">
          <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-xl pl-9" placeholder="Search people, companies, or places" aria-label="Search contacts" /></div><div className="grid grid-cols-2 gap-2 sm:flex"><Select value={priority} onValueChange={(value) => setPriority((value ?? "all") as Priority | "all")}><SelectTrigger className="h-10 w-full rounded-xl sm:w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="high">High priority</SelectItem><SelectItem value="medium">Medium priority</SelectItem><SelectItem value="low">Low priority</SelectItem></SelectContent></Select><Select defaultValue="updated" onValueChange={setSort}><SelectTrigger className="h-10 w-full rounded-xl sm:w-48"><ArrowUpDown className="size-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="updated">Recently updated</SelectItem><SelectItem value="created">Newest added</SelectItem><SelectItem value="name">Name A–Z</SelectItem><SelectItem value="priority">Priority</SelectItem></SelectContent></Select></div></div>
          {contactsQuery.isLoading ? <ContactsLoading /> : contactsQuery.isError ? <QueryError message={contactsQuery.error.message} retry={() => contactsQuery.refetch()} /> : contacts.length === 0 ? <EmptyNetwork onAdd={() => setFormOpen(true)} /> : table.getRowModel().rows.length === 0 ? <NoMatches clear={() => { setSearch(""); setPriority("all"); }} /> : <><div className="hidden md:block"><Table><TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40">{table.getHeaderGroups()[0]?.headers.filter((header) => header.id !== "created_at").map((header) => <TableHead key={header.id} className={cn("h-11 text-xs uppercase tracking-[.1em] text-muted-foreground", header.id === "name" && "pl-5", header.id === "actions" && "w-12")}><button className={cn("flex items-center gap-1", header.column.getCanSort() && "cursor-pointer")} onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() && <ArrowUpDown className="size-3" />}</button></TableHead>)}</TableRow></TableHeader><TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getVisibleCells().filter((cell) => cell.column.id !== "created_at").map((cell) => <TableCell key={cell.id} className={cn("py-4", cell.column.id === "name" && "pl-5")}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table></div><div className="divide-y md:hidden">{table.getRowModel().rows.map((row) => <article key={row.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-semibold">{getInitials(row.original.name)}</div><div className="min-w-0"><h2 className="truncate font-medium">{row.original.name}</h2><p className="truncate text-xs text-muted-foreground">{[row.original.role, row.original.company].filter(Boolean).join(" · ") || "No role added"}</p></div></div><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`} />}><MoreHorizontal /></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingContact(row.original); setFormOpen(true); }}><Pencil />Edit</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><div className="mt-3 flex items-center justify-between gap-3"><p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{row.original.where_met || "Where you met not added"}</p><Badge data-priority={row.original.priority} className="priority-badge rounded-full capitalize">{row.original.priority}</Badge></div></article>)}</div></>}
        </div>
      </section>
      <ContactDialog open={formOpen} contact={editingContact} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingContact(null); }} />
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogMedia><Trash2 className="text-destructive" /></AlertDialogMedia><AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the contact and their notes. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep contact</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}Delete contact</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) { return <div className="rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(18,38,63,.04)]"><p className="text-xs font-medium uppercase tracking-[.12em] text-muted-foreground">{label}</p><div className="mt-3 flex items-end justify-between gap-3"><p className="font-heading text-3xl font-semibold">{value}</p><p className="text-right text-xs text-muted-foreground">{detail}</p></div></div>; }

function ContactsLoading() { return <div className="space-y-0 divide-y">{[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-4 p-5"><Skeleton className="size-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-64 max-w-full" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>)}</div>; }

function QueryError({ message, retry }: { message: string; retry: () => void }) { return <div className="flex flex-col items-center px-5 py-14 text-center"><div className="flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertCircle /></div><h2 className="mt-4 font-heading text-lg font-semibold">We couldn’t load your contacts</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p><Button variant="outline" className="mt-5 rounded-xl" onClick={retry}><RefreshCw />Try again</Button></div>; }

function EmptyNetwork({ onAdd }: { onAdd: () => void }) { return <div className="flex flex-col items-center px-5 py-16 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><CalendarPlus /></div><h2 className="mt-4 font-heading text-xl font-semibold">Start with one person</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Add someone you want to stay connected with. A little context now makes the next conversation easier.</p><Button className="mt-5 rounded-xl" onClick={onAdd}><Plus />Add your first contact</Button></div>; }

function NoMatches({ clear }: { clear: () => void }) { return <div className="flex flex-col items-center px-5 py-14 text-center"><Search className="size-9 text-muted-foreground" /><h2 className="mt-3 font-heading text-lg font-semibold">No contacts match</h2><p className="mt-1 text-sm text-muted-foreground">Try another search or clear your filters.</p><Button variant="outline" className="mt-4 rounded-xl" onClick={clear}>Clear filters</Button></div>; }

function ContactDialog({ open, contact, onOpenChange }: { open: boolean; contact: Contact | null; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const form = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema), defaultValues: emptyContactForm });
  useEffect(() => { form.reset(contact ? valuesFromContact(contact) : emptyContactForm); }, [contact, form, open]);
  const mutation = useMutation({ mutationFn: (values: ContactFormValues) => contact ? updateContact(contact.id, values) : createContact(values), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["contacts"] }); toast.success(contact ? "Contact updated" : "Contact added"); onOpenChange(false); }, onError: (error) => toast.error(error.message) });
  const errors = form.formState.errors;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle className="text-xl">{contact ? "Edit contact" : "Add a new contact"}</DialogTitle><DialogDescription>{contact ? "Update the context you want to remember." : "Save the details that will make your next conversation feel natural."}</DialogDescription></DialogHeader><form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4"><FormField label="Name" error={errors.name?.message} required><Input autoFocus placeholder="Maya Chen" aria-invalid={Boolean(errors.name)} {...form.register("name")} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="Company or organization" error={errors.company?.message}><Input placeholder="Berkeley SkyDeck" aria-invalid={Boolean(errors.company)} {...form.register("company")} /></FormField><FormField label="Role" error={errors.role?.message}><Input placeholder="Product Designer" aria-invalid={Boolean(errors.role)} {...form.register("role")} /></FormField></div><FormField label="Where you met" error={errors.where_met?.message}><Input placeholder="AI Builders Meetup" aria-invalid={Boolean(errors.where_met)} {...form.register("where_met")} /></FormField><FormField label="Priority" error={errors.priority?.message} required><Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value as Priority, { shouldValidate: true })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="high">High — follow up soon</SelectItem><SelectItem value="medium">Medium — keep in touch</SelectItem><SelectItem value="low">Low — remember for later</SelectItem></SelectContent></Select></FormField><FormField label="Notes" error={errors.notes?.message}><Textarea rows={5} placeholder="What did you discuss? What matters to them? What should you follow up on?" aria-invalid={Boolean(errors.notes)} {...form.register("notes")} /></FormField><DialogFooter className="mt-6"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <LoaderCircle className="animate-spin" /> : contact ? <Pencil /> : <Plus />}{contact ? "Save changes" : "Add contact"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function FormField({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}{required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}</Label>{children}{error && <p className="text-xs text-destructive" role="alert">{error}</p>}</div>; }
