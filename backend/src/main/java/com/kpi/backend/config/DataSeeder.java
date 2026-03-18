package com.kpi.backend.config;

import com.kpi.backend.model.KpiMetric;
import com.kpi.backend.repository.KpiMetricRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * Data Seeder for KPI Metrics.
 * 
 * This class seeds the initial 18 default KPI metrics into the database
 * when the application starts for the first time.
 * 
 * The data includes:
 * - 6 KRAs (Key Result Areas) with their weights
 * - 18 metrics (questions) distributed across the KRAs
 * - Rubrics for each metric (percentage-based scoring)
 * 
 * The seeder runs automatically on startup via CommandLineRunner.
 * It only runs if the kpi_metrics table is empty.
 * 
 * @author KPI System
 * @version 1.0
 */
@Configuration
public class DataSeeder {

    /**
     * Bean that runs after Spring Boot application starts.
     * Checks if data exists and seeds if needed.
     * 
     * @param kpiMetricRepository Repository to check/save data
     * @return CommandLineRunner that performs the seeding
     */
    @Bean
    public CommandLineRunner seedKpiData(KpiMetricRepository kpiMetricRepository) {
        return args -> {
            // Only seed if table is empty
            if (kpiMetricRepository.count() == 0) {
                System.out.println("Seeding initial KPI metrics...");
                
                List<KpiMetric> metrics = createDefaultMetrics();
                kpiMetricRepository.saveAll(metrics);
                
                System.out.println("Successfully seeded " + metrics.size() + " KPI metrics!");
            } else {
                System.out.println("KPI metrics already exist, skipping seed.");
            }
        };
    }

    /**
     * Create the default 18 KPI metrics based on the original requirements.
     * 
     * Each metric includes:
     * - KRA name and weight
     * - Metric name (question)
     * - Evidence required
     * - Metric weight (within KRA)
     * - Rubric (JSON format)
     * - requiresFile flag (default: false)
     * - displayOrder for sorting
     * 
     * @return List of 18 KpiMetric objects
     */
    private List<KpiMetric> createDefaultMetrics() {
        List<KpiMetric> metrics = new ArrayList<>();
        
        int order = 1;
        
        // ========================================
        // KRA 1: Lead Discovery (20%)
        // ========================================
        metrics.add(createMetric("Lead Discovery", 20, 
            "% of requirements ready before dev starts",
            "BRD / FSD", 5,
            "{\"1\": \"1% - Less than 20%\", \"2\": \"2% - 20-40%\", \"3\": \"3% - 41-60%\", \"4\": \"4% - 61-80%\", \"5\": \"5% - 81-100%\"}",
            false, order++));
            
        metrics.add(createMetric("Lead Discovery", 20,
            "% of test scenarios identified before QA phase",
            "Test Script", 5,
            "{\"1\": \"1% - Less than 20%\", \"2\": \"2% - 20-40%\", \"3\": \"3% - 41-60%\", \"4\": \"4% - 61-80%\", \"5\": \"5% - 81-100%\"}",
            false, order++));
            
        metrics.add(createMetric("Lead Discovery", 20,
            "Early risk logs",
            "Risk register / Redmine", 5,
            "{\"1\": \"1% - No proactive identification\", \"2\": \"2% - Late with unclear mitigation\", \"3\": \"3% - Logged with some delays\", \"4\": \"4% - Most identified early\", \"5\": \"5% - All identified early\"}",
            false, order++));
            
        metrics.add(createMetric("Lead Discovery", 20,
            "Stakeholder clarity feedback",
            "Stakeholder survey form", 5,
            "{\"1\": \"1% - Very negative\", \"2\": \"2% - Negative\", \"3\": \"3% - Neutral\", \"4\": \"4% - Positive\", \"5\": \"5% - Very positive\"}",
            false, order++));
        
        // ========================================
        // KRA 2: Team Building (15%)
        // ========================================
        metrics.add(createMetric("Team Building", 15,
            "Collaboration with BA/dev",
            "Feedback from team", 5,
            "{\"1\": \"1% - Poor collaboration\", \"2\": \"2% - Some issues\", \"3\": \"3% - Good, minor issues\", \"4\": \"4% - Very good\", \"5\": \"5% - Excellent\"}",
            false, order++));
            
        metrics.add(createMetric("Team Building", 15,
            "Mentorship provided",
            "Evaluation Form", 5,
            "{\"1\": \"1% - No mentorship\", \"2\": \"2% - Limited, inconsistent\", \"3\": \"3% - Good when asked\", \"4\": \"4% - Regular\", \"5\": \"5% - Proactive\"}",
            false, order++));
            
        metrics.add(createMetric("Team Building", 15,
            "Support during crunch periods",
            "Based on observation", 5,
            "{\"1\": \"1% - Unavailable\", \"2\": \"2% - Limited support\", \"3\": \"3% - Available when asked\", \"4\": \"4% - Mostly available\", \"5\": \"5% - Proactively supports\"}",
            false, order++));
        
        // ========================================
        // KRA 3: Communication (15%)
        // ========================================
        metrics.add(createMetric("Communication", 15,
            "Rework due to unclear requirements",
            "Defect re-open rate (ticket)", 5,
            "{\"1\": \"1% - High (>40%)\", \"2\": \"2% - Moderate (21-40%)\", \"3\": \"3% - Low (11-20%)\", \"4\": \"4% - Very low (1-10%)\", \"5\": \"5% - No rework\"}",
            false, order++));
            
        metrics.add(createMetric("Communication", 15,
            "Defect clarity",
            "Email/Redmine timestamps", 5,
            "{\"1\": \"1% - Poor, unclear\", \"2\": \"2% - Slow, unclear\", \"3\": \"3% - Generally timely\", \"4\": \"4% - Good response\", \"5\": \"5% - Very timely, professional\"}",
            false, order++));
            
        metrics.add(createMetric("Communication", 15,
            "Response time to questions",
            "Feedback from team", 5,
            "{\"1\": \"1% - Very slow\", \"2\": \"2% - Slow, needs follow-up\", \"3\": \"3% - Generally responsive\", \"4\": \"4% - Quick response\", \"5\": \"5% - Immediate\"}",
            false, order++));
        
        // ========================================
        // KRA 4: Prioritization (10%)
        // ========================================
        metrics.add(createMetric("Prioritization", 10,
            "Risk-based prioritization",
            "SLA / Redmine priority", 5,
            "{\"1\": \"1% - No prioritization\", \"2\": \"2% - Poor, random\", \"3\": \"3% - Basic applied\", \"4\": \"4% - Good\", \"5\": \"5% - Excellent\"}",
            false, order++));
            
        metrics.add(createMetric("Prioritization", 10,
            "Handling scope changes",
            "CR Form / Redmine", 5,
            "{\"1\": \"1% - Poorly documented\", \"2\": \"2% - Limited analysis\", \"3\": \"3% - Proper docs, minor issues\", \"4\": \"4% - Good with analysis\", \"5\": \"5% - Detailed with approval\"}",
            false, order++));
        
        // ========================================
        // KRA 5: Problem Solving (20%)
        // ========================================
        metrics.add(createMetric("Problem Solving", 20,
            "Escalation frequency",
            "Ticket / Redmine", 7,
            "{\"1\": \"1% - Excessive\", \"2\": \"2% - Frequent\", \"3\": \"3% - Some\", \"4\": \"4% - Few\", \"5\": \"5% - Rare\", \"6\": \"6% - Very rare\", \"7\": \"7% - Minimal\"}",
            false, order++));
            
        metrics.add(createMetric("Problem Solving", 20,
            "Time taken to resolve blockers",
            "Escalation logs", 7,
            "{\"1\": \"1% - Unresolved\", \"2\": \"2% - Slow\", \"3\": \"3% - Takes time\", \"4\": \"4% - Mostly timely\", \"5\": \"5% - Good\", \"6\": \"6% - Quick\", \"7\": \"7% - Immediate\"}",
            false, order++));
            
        metrics.add(createMetric("Problem Solving", 20,
            "Ability to negotiate requirement conflicts",
            "Meeting notes / Emails", 6,
            "{\"1\": \"1% - Cannot resolve\", \"2\": \"2% - Struggles\", \"3\": \"3% - Reasonable\", \"4\": \"4% - Good\", \"5\": \"5% - Very good\", \"6\": \"6% - Excellent\"}",
            false, order++));
        
        // ========================================
        // KRA 6: Process Efficiency (20%)
        // ========================================
        metrics.add(createMetric("Process Efficiency", 20,
            "Rework rate",
            "Ticket / Redmine", 7,
            "{\"1\": \"1% - Very high\", \"2\": \"2% - High\", \"3\": \"3% - Moderate\", \"4\": \"4% - Low\", \"5\": \"5% - Very low\", \"6\": \"6% - Minimal\", \"7\": \"7% - None\"}",
            false, order++));
            
        metrics.add(createMetric("Process Efficiency", 20,
            "On-time documentation",
            "Documentation logs", 7,
            "{\"1\": \"1% - Frequently late\", \"2\": \"2% - Often late\", \"3\": \"3% - Sometimes late\", \"4\": \"4% - Usually on time\", \"5\": \"5% - Mostly on time\", \"6\": \"6% - Almost always\", \"7\": \"7% - Always on time\"}",
            false, order++));
            
        metrics.add(createMetric("Process Efficiency", 20,
            "Test deliverable timeline",
            "QA cycle delays", 6,
            "{\"1\": \"1% - Significant delays\", \"2\": \"2% - Frequent delays\", \"3\": \"3% - Some delays\", \"4\": \"4% - Minor occasionally\", \"5\": \"5% - Mostly on time\", \"6\": \"6% - Usually on time\"}",
            false, order++));
        
        return metrics;
    }

    /**
     * Helper method to create a KpiMetric object.
     * 
     * @param kraName KRA name
     * @param kraWeight KRA weight percentage
     * @param metricName Metric/question text
     * @param evidence Evidence required
     * @param metricWeight Weight within KRA
     * @param rubricJson Rubric in JSON format
     * @param requiresFile Whether file upload is required
     * @param displayOrder Order in list
     * @return Configured KpiMetric object
     */
    private KpiMetric createMetric(String kraName, int kraWeight, String metricName,
                                   String evidence, int metricWeight, String rubricJson,
                                   boolean requiresFile, int displayOrder) {
        KpiMetric metric = new KpiMetric();
        metric.setKraName(kraName);
        metric.setKraWeight(kraWeight);
        metric.setMetricName(metricName);
        metric.setEvidence(evidence);
        metric.setMetricWeight(metricWeight);
        metric.setRubricJson(rubricJson);
        metric.setRequiresFile(requiresFile);
        metric.setDisplayOrder(displayOrder);
        return metric;
    }
}
