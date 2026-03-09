const SUPABASE_URL = "https://rutzgbwziinixdrryirv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2R4b3BqeW90dnJ2aWZjcHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzOTQxMiwiZXhwIjoyMDg4NTE1NDEyfQ.IlKYxrl1P1L_oN5U2QMzaCJ82K6A0Q9q-hRuHMbnQgM";

const templates = [
    {
        industry: 'restaurant',
        name: 'Restaurante / Café',
        default_topics: [
            { name: 'Horarios', description: 'Horario de atención' },
            { name: 'Menú', description: 'Datos del menú y platos' },
            { name: 'Ubicación', description: 'Dirección física' },
            { name: 'Reservas', description: 'Cómo agendar una mesa' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'clinic',
        name: 'Clínica / Salud',
        default_topics: [
            { name: 'Citas', description: 'Agendar o cancelar consultas' },
            { name: 'Servicios médicos', description: 'Especialidades disponibles' },
            { name: 'Cobertura', description: 'Seguros y planes' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'salon',
        name: 'Estética / Salón',
        default_topics: [
            { name: 'Citas', description: 'Agendar cita' },
            { name: 'Precios', description: 'Costo de servicios' },
            { name: 'Servicios', description: 'Lista de cortes, uñas, etc.' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'retail',
        name: 'Tienda Física',
        default_topics: [
            { name: 'Inventario', description: 'Consultar si hay stock' },
            { name: 'Horarios', description: 'Apertura y cierre' },
            { name: 'Devoluciones', description: 'Política de devolución' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'gym',
        name: 'Gimnasio',
        default_topics: [
            { name: 'Membresías', description: 'Precios y mensualidades' },
            { name: 'Clases grupales', description: 'Yoga, spinning, etc.' },
            { name: 'Horarios', description: 'Horas de la instalación' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'professional_services',
        name: 'Servicios Profesionales',
        default_topics: [
            { name: 'Cotizaciones', description: 'Pedir un presupuesto' },
            { name: 'Servicios', description: 'Catálogo de lo que hacen' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    },
    {
        industry: 'other',
        name: 'Otro',
        default_topics: [
            { name: 'Información', description: 'Datos generales' },
            { name: 'Ventas', description: 'Información de compra' }
        ],
        default_escalation_rules: [],
        sample_questions: []
    }
];

async function run() {
    console.log('Inserting templates...');
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/industry_templates?on_conflict=industry`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(templates)
        });

        if (!res.ok) {
            console.error('Error seeding:', await res.text());
            process.exit(1);
        }
        const data = await res.json();
        console.log(`Success! Inserted ${data.length} templates.`);
    } catch (err) {
        console.error(err);
    }
}

run();
