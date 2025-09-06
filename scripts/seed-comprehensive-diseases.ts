import { db } from "../src/db";
import { diseases } from "../src/db/schema";

// Comprehensive disease database with ICD-10 codes
const comprehensiveDiseases = [
  // Respiratory Diseases
  {
    name: "Common Cold",
    description:
      "A viral infection of the upper respiratory tract, typically causing symptoms like runny nose, sneezing, and mild fever.",
    icdCode: "J00",
    severityLevel: "mild" as const,
    isCommon: true,
    prevalence: "0.15",
    treatmentInfo:
      "Rest, hydration, over-the-counter medications for symptom relief.",
    preventionInfo:
      "Frequent hand washing, avoiding close contact with sick individuals.",
  },
  {
    name: "Influenza (Flu)",
    description:
      "A contagious respiratory illness caused by influenza viruses, with symptoms including fever, body aches, and fatigue.",
    icdCode: "J10",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.08",
    treatmentInfo:
      "Antiviral medications, rest, hydration, and symptom management.",
    preventionInfo: "Annual flu vaccination, good hygiene practices.",
  },
  {
    name: "Pneumonia",
    description:
      "Infection of the lungs that can cause inflammation and fluid buildup, leading to breathing difficulties and chest pain.",
    icdCode: "J18",
    severityLevel: "severe" as const,
    isCommon: true,
    prevalence: "0.03",
    treatmentInfo:
      "Antibiotics (if bacterial), antiviral medications (if viral), supportive care.",
    preventionInfo:
      "Vaccination, good hygiene, avoiding smoking, managing chronic conditions.",
  },
  {
    name: "Bronchitis",
    description:
      "Inflammation of the bronchial tubes, causing coughing, chest discomfort, and sometimes difficulty breathing.",
    icdCode: "J40",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.05",
    treatmentInfo:
      "Rest, hydration, cough suppressants, bronchodilators if needed.",
    preventionInfo:
      "Avoid smoking, get flu and pneumonia vaccines, practice good hygiene.",
  },
  {
    name: "Asthma",
    description:
      "A chronic respiratory condition causing airway inflammation and narrowing, leading to wheezing and breathing difficulties.",
    icdCode: "J45",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.08",
    treatmentInfo:
      "Inhalers (bronchodilators and corticosteroids), avoiding triggers, emergency medications.",
    preventionInfo:
      "Identify and avoid triggers, regular medication use, flu vaccination.",
  },

  // Cardiovascular Diseases
  {
    name: "Hypertension",
    description:
      "High blood pressure, a chronic condition that can lead to serious health complications if left untreated.",
    icdCode: "I10",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.25",
    treatmentInfo:
      "Lifestyle modifications, antihypertensive medications, regular monitoring.",
    preventionInfo:
      "Healthy diet, regular exercise, weight management, stress reduction.",
  },
  {
    name: "Coronary Artery Disease",
    description:
      "Narrowing of coronary arteries due to plaque buildup, reducing blood flow to the heart muscle.",
    icdCode: "I25",
    severityLevel: "severe" as const,
    isCommon: true,
    prevalence: "0.07",
    treatmentInfo:
      "Lifestyle changes, medications (statins, antiplatelets), procedures (stents, bypass surgery).",
    preventionInfo:
      "Healthy diet, regular exercise, no smoking, manage diabetes and hypertension.",
  },
  {
    name: "Heart Failure",
    description:
      "A condition where the heart cannot pump blood effectively, leading to fluid buildup and breathing difficulties.",
    icdCode: "I50",
    severityLevel: "severe" as const,
    isCommon: true,
    prevalence: "0.02",
    treatmentInfo:
      "Medications (ACE inhibitors, diuretics), lifestyle modifications, device therapy if needed.",
    preventionInfo:
      "Control risk factors, regular exercise, healthy diet, medication adherence.",
  },
  {
    name: "Atrial Fibrillation",
    description:
      "An irregular heart rhythm that can increase the risk of stroke and other complications.",
    icdCode: "I48",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.03",
    treatmentInfo:
      "Rate control medications, rhythm control, anticoagulation, procedures if needed.",
    preventionInfo:
      "Control risk factors, regular monitoring, medication adherence.",
  },

  // Endocrine Diseases
  {
    name: "Diabetes Type 2",
    description:
      "A chronic condition where the body cannot effectively use insulin, leading to high blood sugar levels.",
    icdCode: "E11",
    severityLevel: "severe" as const,
    isCommon: true,
    prevalence: "0.09",
    treatmentInfo:
      "Lifestyle changes, oral medications, insulin therapy, blood sugar monitoring.",
    preventionInfo:
      "Healthy diet, regular exercise, weight management, regular health checkups.",
  },
  {
    name: "Diabetes Type 1",
    description:
      "An autoimmune condition where the pancreas produces little or no insulin, requiring insulin therapy.",
    icdCode: "E10",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.005",
    treatmentInfo:
      "Insulin therapy, blood sugar monitoring, carbohydrate counting, regular medical care.",
    preventionInfo:
      "No known prevention, early detection and management are crucial.",
  },
  {
    name: "Hypothyroidism",
    description:
      "Underactive thyroid gland, leading to fatigue, weight gain, and other metabolic symptoms.",
    icdCode: "E03",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.05",
    treatmentInfo:
      "Thyroid hormone replacement medication, regular monitoring of thyroid function.",
    preventionInfo: "Regular thyroid screening, especially for women over 60.",
  },
  {
    name: "Hyperthyroidism",
    description:
      "Overactive thyroid gland, causing weight loss, rapid heartbeat, and nervousness.",
    icdCode: "E05",
    severityLevel: "moderate" as const,
    isCommon: false,
    prevalence: "0.01",
    treatmentInfo:
      "Antithyroid medications, radioactive iodine, surgery, beta-blockers for symptoms.",
    preventionInfo:
      "Regular thyroid screening, especially for women and those with family history.",
  },

  // Gastrointestinal Diseases
  {
    name: "Gastroenteritis",
    description:
      "Inflammation of the stomach and intestines, commonly caused by viral or bacterial infections, leading to diarrhea and vomiting.",
    icdCode: "K59.1",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.06",
    treatmentInfo:
      "Fluid replacement, electrolyte solutions, rest, dietary modifications.",
    preventionInfo:
      "Proper food handling, hand hygiene, safe water consumption.",
  },
  {
    name: "Irritable Bowel Syndrome (IBS)",
    description:
      "A functional gastrointestinal disorder causing abdominal pain, bloating, and changes in bowel habits.",
    icdCode: "K58",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.1",
    treatmentInfo:
      "Dietary modifications, stress management, medications for specific symptoms.",
    preventionInfo:
      "Identify trigger foods, manage stress, regular exercise, adequate sleep.",
  },
  {
    name: "Gastroesophageal Reflux Disease (GERD)",
    description:
      "Chronic acid reflux causing heartburn, chest pain, and potential damage to the esophagus.",
    icdCode: "K21",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.2",
    treatmentInfo:
      "Lifestyle modifications, antacids, H2 blockers, proton pump inhibitors.",
    preventionInfo:
      "Avoid trigger foods, maintain healthy weight, don't lie down after eating.",
  },
  {
    name: "Peptic Ulcer Disease",
    description:
      "Sores in the lining of the stomach or duodenum, often caused by H. pylori infection or NSAID use.",
    icdCode: "K25",
    severityLevel: "moderate" as const,
    isCommon: false,
    prevalence: "0.01",
    treatmentInfo:
      "Antibiotics for H. pylori, acid-reducing medications, avoiding NSAIDs.",
    preventionInfo:
      "Avoid NSAIDs when possible, treat H. pylori infection, manage stress.",
  },

  // Neurological Diseases
  {
    name: "Migraine",
    description:
      "A neurological condition characterized by severe headaches, often accompanied by nausea, vomiting, and sensitivity to light.",
    icdCode: "G43",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.12",
    treatmentInfo:
      "Pain relievers, triptans, preventive medications, lifestyle modifications.",
    preventionInfo:
      "Identify and avoid triggers, maintain regular sleep schedule, stress management.",
  },
  {
    name: "Tension Headache",
    description:
      "The most common type of headache, characterized by mild to moderate pain and pressure around the head.",
    icdCode: "G44.2",
    severityLevel: "mild" as const,
    isCommon: true,
    prevalence: "0.3",
    treatmentInfo:
      "Over-the-counter pain relievers, stress management, relaxation techniques.",
    preventionInfo:
      "Manage stress, maintain good posture, regular exercise, adequate sleep.",
  },
  {
    name: "Epilepsy",
    description:
      "A neurological disorder characterized by recurrent seizures due to abnormal electrical activity in the brain.",
    icdCode: "G40",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.01",
    treatmentInfo:
      "Antiepileptic medications, lifestyle modifications, surgery in some cases.",
    preventionInfo:
      "Avoid head injuries, manage stress, take medications as prescribed.",
  },
  {
    name: "Multiple Sclerosis",
    description:
      "An autoimmune disease affecting the central nervous system, causing various neurological symptoms.",
    icdCode: "G35",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Disease-modifying therapies, symptom management, physical therapy.",
    preventionInfo:
      "No known prevention, early diagnosis and treatment are important.",
  },

  // Musculoskeletal Diseases
  {
    name: "Osteoarthritis",
    description:
      "Degenerative joint disease causing pain, stiffness, and reduced mobility in affected joints.",
    icdCode: "M19",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.15",
    treatmentInfo:
      "Pain management, physical therapy, joint protection, surgery in severe cases.",
    preventionInfo:
      "Maintain healthy weight, regular exercise, joint protection, avoid overuse.",
  },
  {
    name: "Rheumatoid Arthritis",
    description:
      "An autoimmune disease causing chronic inflammation of joints, leading to pain, swelling, and deformity.",
    icdCode: "M06",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.01",
    treatmentInfo:
      "Disease-modifying antirheumatic drugs, anti-inflammatory medications, physical therapy.",
    preventionInfo:
      "No known prevention, early diagnosis and treatment are crucial.",
  },
  {
    name: "Fibromyalgia",
    description:
      "A chronic condition characterized by widespread pain, fatigue, and tender points throughout the body.",
    icdCode: "M79.3",
    severityLevel: "moderate" as const,
    isCommon: false,
    prevalence: "0.02",
    treatmentInfo:
      "Pain management, physical therapy, stress reduction, sleep improvement.",
    preventionInfo:
      "Manage stress, maintain regular sleep schedule, gentle exercise.",
  },
  {
    name: "Osteoporosis",
    description:
      "A condition characterized by weak, brittle bones that are more prone to fractures.",
    icdCode: "M81",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.1",
    treatmentInfo:
      "Calcium and vitamin D supplements, bisphosphonates, fall prevention.",
    preventionInfo:
      "Adequate calcium and vitamin D, weight-bearing exercise, avoid smoking and excessive alcohol.",
  },

  // Dermatological Diseases
  {
    name: "Eczema (Atopic Dermatitis)",
    description:
      "A chronic skin condition causing dry, itchy, and inflamed skin, often appearing in childhood.",
    icdCode: "L20",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.1",
    treatmentInfo:
      "Moisturizers, topical corticosteroids, antihistamines, avoiding triggers.",
    preventionInfo:
      "Keep skin moisturized, avoid harsh soaps, identify and avoid triggers.",
  },
  {
    name: "Psoriasis",
    description:
      "An autoimmune skin condition causing red, scaly patches on the skin, often on elbows, knees, and scalp.",
    icdCode: "L40",
    severityLevel: "moderate" as const,
    isCommon: false,
    prevalence: "0.02",
    treatmentInfo:
      "Topical treatments, phototherapy, systemic medications, biologics.",
    preventionInfo:
      "Manage stress, avoid triggers, maintain healthy lifestyle.",
  },
  {
    name: "Acne",
    description:
      "A common skin condition causing pimples, blackheads, and whiteheads, primarily on the face and back.",
    icdCode: "L70",
    severityLevel: "mild" as const,
    isCommon: true,
    prevalence: "0.2",
    treatmentInfo:
      "Topical treatments, oral medications, proper skin care, professional treatments.",
    preventionInfo:
      "Gentle skin care, avoid picking, manage stress, proper hygiene.",
  },
  {
    name: "Urticaria (Hives)",
    description:
      "A skin condition causing raised, itchy welts that can appear anywhere on the body.",
    icdCode: "L50",
    severityLevel: "mild" as const,
    isCommon: true,
    prevalence: "0.15",
    treatmentInfo:
      "Antihistamines, avoiding triggers, cool compresses, emergency treatment if severe.",
    preventionInfo:
      "Identify and avoid triggers, manage stress, carry emergency medication if needed.",
  },

  // Genitourinary Diseases
  {
    name: "Urinary Tract Infection (UTI)",
    description:
      "Bacterial infection of the urinary system, commonly affecting the bladder and urethra.",
    icdCode: "N39.0",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.12",
    treatmentInfo:
      "Antibiotics, increased fluid intake, pain management, prevention strategies.",
    preventionInfo:
      "Stay hydrated, urinate frequently, wipe front to back, avoid irritating products.",
  },
  {
    name: "Kidney Stones",
    description:
      "Hard deposits of minerals and salts that form in the kidneys and can cause severe pain when passing.",
    icdCode: "N20",
    severityLevel: "severe" as const,
    isCommon: true,
    prevalence: "0.05",
    treatmentInfo:
      "Pain management, increased fluid intake, medical procedures if needed, dietary changes.",
    preventionInfo:
      "Stay hydrated, limit sodium and oxalate, maintain healthy weight, adequate calcium intake.",
  },
  {
    name: "Benign Prostatic Hyperplasia (BPH)",
    description:
      "Enlargement of the prostate gland in men, causing urinary symptoms such as frequent urination and difficulty starting urination.",
    icdCode: "N40",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.25",
    treatmentInfo:
      "Medications, minimally invasive procedures, surgery in severe cases.",
    preventionInfo:
      "Regular exercise, maintain healthy weight, limit alcohol and caffeine.",
  },

  // Psychiatric Diseases
  {
    name: "Anxiety Disorder",
    description:
      "A mental health condition characterized by excessive worry, fear, and physical symptoms like rapid heartbeat.",
    icdCode: "F41",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.18",
    treatmentInfo:
      "Therapy, medications, lifestyle modifications, stress management techniques.",
    preventionInfo:
      "Stress management, regular exercise, healthy sleep habits, social support.",
  },
  {
    name: "Depression",
    description:
      "A mood disorder causing persistent feelings of sadness, hopelessness, and loss of interest in activities.",
    icdCode: "F32",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.15",
    treatmentInfo:
      "Therapy, antidepressant medications, lifestyle changes, support groups.",
    preventionInfo:
      "Maintain social connections, regular exercise, healthy sleep, stress management.",
  },
  {
    name: "Bipolar Disorder",
    description:
      "A mood disorder characterized by episodes of mania and depression, affecting mood, energy, and activity levels.",
    icdCode: "F31",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.01",
    treatmentInfo:
      "Mood stabilizers, therapy, lifestyle management, support systems.",
    preventionInfo:
      "No known prevention, early diagnosis and treatment are crucial.",
  },
  {
    name: "Insomnia",
    description:
      "A sleep disorder characterized by difficulty falling asleep, staying asleep, or getting quality sleep.",
    icdCode: "G47.0",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.2",
    treatmentInfo:
      "Sleep hygiene, cognitive behavioral therapy, medications if needed.",
    preventionInfo:
      "Maintain regular sleep schedule, create comfortable sleep environment, limit caffeine and screens.",
  },

  // Infectious Diseases
  {
    name: "Malaria",
    description:
      "A mosquito-borne infectious disease caused by Plasmodium parasites, common in tropical regions.",
    icdCode: "B54",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Antimalarial medications, supportive care, prevention of complications.",
    preventionInfo:
      "Use mosquito nets, insect repellent, antimalarial prophylaxis when traveling.",
  },
  {
    name: "Tuberculosis",
    description:
      "A bacterial infection primarily affecting the lungs, spread through airborne droplets.",
    icdCode: "A15",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Long-term antibiotic treatment, directly observed therapy, isolation if needed.",
    preventionInfo:
      "BCG vaccination, early detection and treatment, infection control measures.",
  },
  {
    name: "Hepatitis B",
    description:
      "A viral infection of the liver that can cause acute or chronic liver disease.",
    icdCode: "B16",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.005",
    treatmentInfo:
      "Antiviral medications, monitoring, liver transplant in severe cases.",
    preventionInfo:
      "Hepatitis B vaccination, safe sex practices, avoid sharing needles.",
  },
  {
    name: "HIV/AIDS",
    description:
      "A viral infection that attacks the immune system, leading to acquired immunodeficiency syndrome.",
    icdCode: "B20",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Antiretroviral therapy, prevention of opportunistic infections, supportive care.",
    preventionInfo:
      "Safe sex practices, avoid sharing needles, pre-exposure prophylaxis (PrEP).",
  },

  // Eye and Ear Diseases
  {
    name: "Conjunctivitis (Pink Eye)",
    description:
      "Inflammation of the conjunctiva, causing redness, itching, and discharge from the eye.",
    icdCode: "H10",
    severityLevel: "mild" as const,
    isCommon: true,
    prevalence: "0.08",
    treatmentInfo:
      "Antibiotic or antiviral eye drops, warm compresses, good hygiene.",
    preventionInfo:
      "Wash hands frequently, avoid touching eyes, don't share personal items.",
  },
  {
    name: "Cataracts",
    description:
      "Clouding of the eye's natural lens, causing blurred vision and sensitivity to light.",
    icdCode: "H25",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.2",
    treatmentInfo:
      "Surgery to remove and replace the lens, glasses or contact lenses.",
    preventionInfo:
      "Wear sunglasses, avoid smoking, manage diabetes, regular eye exams.",
  },
  {
    name: "Glaucoma",
    description:
      "A group of eye conditions that damage the optic nerve, often caused by high eye pressure.",
    icdCode: "H40",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.02",
    treatmentInfo:
      "Eye drops, oral medications, laser treatment, surgery if needed.",
    preventionInfo:
      "Regular eye exams, early detection and treatment, manage risk factors.",
  },
  {
    name: "Otitis Media (Ear Infection)",
    description:
      "Infection of the middle ear, common in children, causing ear pain and sometimes fever.",
    icdCode: "H66",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.1",
    treatmentInfo:
      "Antibiotics if bacterial, pain management, warm compresses, monitoring.",
    preventionInfo:
      "Avoid secondhand smoke, treat allergies, practice good hygiene.",
  },

  // Blood and Immune System Diseases
  {
    name: "Anemia",
    description:
      "A condition where the body lacks enough healthy red blood cells to carry adequate oxygen.",
    icdCode: "D64",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.15",
    treatmentInfo:
      "Iron supplements, dietary changes, treating underlying cause, blood transfusions if severe.",
    preventionInfo:
      "Eat iron-rich foods, manage chronic conditions, regular blood tests.",
  },
  {
    name: "Leukemia",
    description:
      "Cancer of the blood-forming tissues, including bone marrow and lymphatic system.",
    icdCode: "C91",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Chemotherapy, radiation therapy, bone marrow transplant, targeted therapy.",
    preventionInfo:
      "Avoid known risk factors, early detection through regular checkups.",
  },
  {
    name: "Lymphoma",
    description:
      "Cancer of the lymphatic system, affecting lymph nodes and other lymphatic tissues.",
    icdCode: "C85",
    severityLevel: "severe" as const,
    isCommon: false,
    prevalence: "0.001",
    treatmentInfo:
      "Chemotherapy, radiation therapy, immunotherapy, stem cell transplant.",
    preventionInfo:
      "Avoid known risk factors, early detection through regular checkups.",
  },

  // Metabolic Diseases
  {
    name: "Gout",
    description:
      "A form of arthritis caused by excess uric acid in the blood, leading to joint pain and inflammation.",
    icdCode: "M10",
    severityLevel: "moderate" as const,
    isCommon: false,
    prevalence: "0.02",
    treatmentInfo:
      "Pain management, medications to reduce uric acid, dietary changes.",
    preventionInfo:
      "Limit purine-rich foods, maintain healthy weight, limit alcohol, stay hydrated.",
  },
  {
    name: "Hyperlipidemia",
    description:
      "High levels of fats (lipids) in the blood, including cholesterol and triglycerides.",
    icdCode: "E78",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.2",
    treatmentInfo:
      "Statins, lifestyle changes, dietary modifications, regular monitoring.",
    preventionInfo:
      "Healthy diet, regular exercise, maintain healthy weight, avoid smoking.",
  },
  {
    name: "Metabolic Syndrome",
    description:
      "A cluster of conditions that increase the risk of heart disease, stroke, and diabetes.",
    icdCode: "E88.81",
    severityLevel: "moderate" as const,
    isCommon: true,
    prevalence: "0.25",
    treatmentInfo:
      "Lifestyle changes, medications for individual conditions, weight management.",
    preventionInfo:
      "Maintain healthy weight, regular exercise, healthy diet, manage blood pressure and blood sugar.",
  },
];

async function seedDiseases() {
  console.log("🌱 Starting comprehensive disease seeding...");

  try {
    // Check if diseases already exist
    const existingDiseases = await db.select().from(diseases);
    console.log(`📊 Found ${existingDiseases.length} existing diseases`);

    if (existingDiseases.length > 0) {
      console.log("⚠️ Diseases already exist. Adding new diseases only...");

      // Get existing disease names
      const existingNames = existingDiseases.map((d) => d.name);

      // Filter out diseases that already exist
      const newDiseases = comprehensiveDiseases.filter(
        (disease) => !existingNames.includes(disease.name)
      );

      if (newDiseases.length === 0) {
        console.log("✅ All diseases already exist in database");
        return;
      }

      console.log(`📊 Adding ${newDiseases.length} new diseases...`);
      const insertedDiseases = await db
        .insert(diseases)
        .values(newDiseases)
        .returning();
      console.log(
        `✅ Successfully added ${insertedDiseases.length} new diseases!`
      );
    } else {
      // No existing diseases, insert all
      console.log(`📊 Inserting ${comprehensiveDiseases.length} diseases...`);
      const insertedDiseases = await db
        .insert(diseases)
        .values(comprehensiveDiseases)
        .returning();
      console.log(
        `✅ Successfully seeded ${insertedDiseases.length} diseases!`
      );
    }

    console.log("📋 Disease categories included:");
    console.log("   - Respiratory Diseases (5)");
    console.log("   - Cardiovascular Diseases (4)");
    console.log("   - Endocrine Diseases (4)");
    console.log("   - Gastrointestinal Diseases (4)");
    console.log("   - Neurological Diseases (4)");
    console.log("   - Musculoskeletal Diseases (4)");
    console.log("   - Dermatological Diseases (4)");
    console.log("   - Genitourinary Diseases (3)");
    console.log("   - Psychiatric Diseases (4)");
    console.log("   - Infectious Diseases (4)");
    console.log("   - Eye and Ear Diseases (4)");
    console.log("   - Blood and Immune System Diseases (3)");
    console.log("   - Metabolic Diseases (3)");

    console.log("🎉 Disease seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding diseases:", error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedDiseases()
    .then(() => {
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDiseases, comprehensiveDiseases };
