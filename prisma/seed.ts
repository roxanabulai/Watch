import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const certinaImages = [
  "/images/certina/certina-in-box-front.jpeg",
  "/images/certina/certina-dial-close.jpeg",
  "/images/certina/certina-open-box.jpeg",
  "/images/certina/certina-box-stamp.jpeg",
  "/images/certina/certina-caseback-close.jpeg",
  "/images/certina/certina-side-profile.jpeg",
  "/images/certina/certina-full-strap.jpeg",
  "/images/certina/certina-box-logo.jpeg"
];

const continentalImages = [
  "/images/continental/continental-front.jpeg",
  "/images/continental/continental-dial-close.jpeg",
  "/images/continental/continental-angle.jpeg",
  "/images/continental/continental-full-horizontal.jpeg",
  "/images/continental/continental-caseback.jpeg",
  "/images/continental/continental-strap-inside.jpeg",
  "/images/continental/continental-strap-holes.jpeg",
  "/images/continental/continental-buckle.jpeg"
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@horologe.test" },
    update: {},
    create: {
      email: "admin@horologe.test",
      name: "Auction Director",
      role: "ADMIN",
      passwordHash: await hashPassword("password123")
    }
  });

  const bidder = await prisma.user.upsert({
    where: { email: "bidder@horologe.test" },
    update: {},
    create: {
      email: "bidder@horologe.test",
      name: "Collector",
      passwordHash: await hashPassword("password123")
    }
  });

  await prisma.notification.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.image.deleteMany();
  await prisma.auction.deleteMany();

  await prisma.auction.create({
    data: {
      title: "Vintage Certina Gold Plated 20 Microns with Original Box",
      slug: "vintage-certina-gold-plated-20-microns-original-box",
      brand: "Certina",
      model: "0806 541",
      reference: "5378214",
      category: "Vintage",
      condition: "Very good",
      year: 1965,
      movement: "Manual wind",
      caseMaterial: "Gold plated 20 microns / gold capped",
      bracelet: "Black genuine calf leather strap",
      diameterMm: 30,
      description:
        "Elegant vintage Certina wristwatch offered with its original Certina presentation box. The watch is model 0806 541, case/reference number 5378214, with a compact case of approximately 30 mm or slightly under. The gold-toned case is marked as gold plated 20 microns, also commonly described as gold capped, giving the watch a warm and refined dress-watch presence. The silver dial carries applied baton hour markers, slim hands, Certina signature, and a faceted crystal that adds a distinctive vintage sparkle. It is fitted to a black genuine calf leather strap with gold-tone hardware. The watch runs very well, keeps time well, and presents in very good overall condition for its age. The original box adds strong charm and collectability, including Swiss-made markings and a period retailer stamp from John Mansons Eftr., Norrkoping. A graceful, wearable vintage Certina with the right details for collectors who value originality, presentation, and classic Swiss design.",
      provenance: "Private collection. Includes original Certina box with period Swedish retailer stamp.",
      estimateLow: 180,
      estimateHigh: 320,
      startingBid: 120,
      currentBid: 120,
      bidIncrement: 10,
      endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: "LIVE",
      sellerId: admin.id,
      images: {
        create: certinaImages.map((url, position) => ({
          url,
          alt: position === 0 ? "Vintage Certina gold plated watch with original box" : `Vintage Certina detail ${position}`,
          position
        }))
      },
      bids: {
        create: { amount: 120, userId: bidder.id }
      }
    }
  });

  await prisma.auction.create({
    data: {
      title: "Continental Ladies Quartz Watch Model 1076-24",
      slug: "continental-ladies-quartz-1076-24",
      brand: "Continental",
      model: "1076-24",
      reference: "1076-24",
      category: "Dress",
      condition: "Like new",
      year: 1995,
      movement: "Quartz",
      caseMaterial: "Gold-tone stainless steel",
      bracelet: "New brown leather strap",
      diameterMm: 28,
      description:
        "Elegant Continental ladies quartz watch, model 1076-24, presented in exceptional condition. The watch has a warm gold-tone case with a fluted bezel, refined lugs, and a clean champagne dial with slim applied hour markers and Swiss Made text. It is fitted with a new brown leather strap with contrast stitching and gold-tone buckle, giving the watch a polished, ready-to-wear look. The condition is outstanding: no visible defects, no scratches, and the watch presents like new. A tasteful, slim quartz dress watch with classic proportions, ideal for daily elegance or as a refined gift.",
      provenance: "Private collection. Presented with a new leather strap.",
      estimateLow: 70,
      estimateHigh: 130,
      startingBid: 45,
      currentBid: 45,
      bidIncrement: 5,
      endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "LIVE",
      sellerId: admin.id,
      images: {
        create: continentalImages.map((url, position) => ({
          url,
          alt: position === 0 ? "Continental ladies quartz watch model 1076-24" : `Continental 1076-24 detail ${position}`,
          position
        }))
      },
      bids: {
        create: { amount: 45, userId: bidder.id }
      }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
