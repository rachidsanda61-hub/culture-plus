import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding ...')

    // Clean up first (optional but good for testing)
    // await prisma.event.deleteMany();
    // await prisma.user.deleteMany();

    // 1. Seed Events
    const events = [
        {
            title: "Festival de la Mode Nigérienne - FIMA 2026",
            category: "Mode & Design",
            date: "12 Déc 2026",
            location: "Niamey, Palais des Congrès",
            slug: "fima-2026",
            description: "Le rendez-vous incontournable de la mode africaine. Défilés, concours et expositions.",
            likes: 120,
            interested: 450
        },
        {
            title: "Concert de la Paix - Sahel Tour",
            category: "Musique",
            date: "05 Nov 2026",
            location: "Agadez, Stade Régional",
            slug: "sahel-tour",
            description: "Un concert géant pour célébrer la paix et l'unité dans le Sahel avec les plus grands artistes.",
            image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=800",
            likes: 340,
            interested: 890
        }
    ]

    for (const ev of events) {
        await prisma.event.upsert({
            where: { slug: ev.slug },
            update: ev,
            create: ev
        })
    }

    // 2. Seed Users/Profiles
    const users = [
        {
            id: "amina-kader",
            name: "Amina Kader",
            email: "amina@cultureplus.ne",
            role: "artist",
            location: "Niamey",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
            tags: ["Art Contemporain", "Peinture", "Formation"],
            bio: "Artiste peintre passionnée par les couleurs du Sahel. J'anime également des ateliers pour les jeunes talents.",
            followers: 1240,
            rating: 4.8,
        },
        {
            id: "balkissa-sina",
            name: "Balkissa Sina",
            email: "balkissa@cultureplus.ne",
            role: "artist",
            location: "Zinder",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
            tags: ["Théâtre", "Conte", "Slam"],
            bio: "Comédienne et conteuse engagée, Balkissa Sina fait vibrer les planches par son talent et son charisme.",
            followers: 850,
            rating: 4.9,
        }
    ]

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: u,
            create: u
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
