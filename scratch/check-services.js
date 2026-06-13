import mongoose from "mongoose";
import Service from "../models/service.model.js";
import Worker from "../models/worker.model.js";
import Portfolio from "../models/portfolio.model.js";

async function check() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/test");
    console.log("DB Connected successfully for checking");

    const workers = await Worker.find({});
    console.log(`Total workers in DB: ${workers.length}`);
    for (const w of workers) {
      console.log(`Worker: ${w.name} (_id: ${w._id}), category: ${w.category}`);
    }

    const services = await Service.find({});
    console.log(`Total services in DB: ${services.length}`);
    for (const s of services) {
      console.log(`Service: ${s.title} (worker: ${s.worker}, category: ${s.category}, status: ${s.status}, price: ${s.price})`);
    }

    const portfolios = await Portfolio.find({});
    console.log(`Total portfolio items: ${portfolios.length}`);
    for (const p of portfolios) {
      console.log(`Work: ${p.title} (worker: ${p.worker}, status: ${p.status})`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error running check:", error);
  }
}

check();
