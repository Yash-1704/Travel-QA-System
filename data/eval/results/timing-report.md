# Timing Evaluation Report

**Date:** 2026-10-25T08:59:35.842Z  
**Completed Repetitions:** 3 (Rep 1 on 2026-10-25, Rep 2 on 2026-10-25, Rep 3 on 2026-10-25)  
**Questions in Timing Subset:** 20 test questions (cache bypassed)  

## 1. System Latency Summary (ms)

| System | Median Latency (ms) | p95 Latency (ms) (nearest rank) |
|---|---|---|
| **V1 (RAG Baseline)** | 1070 ms | 1614 ms |
| **V2 (Classify-First)** | 934 ms | 1755 ms |

## 2. V2 Stage Latency Breakdown (Median)

| Stage | Median Latency (ms) |
|---|---|
| **Classification (LLM)** | 155 ms |
| **Targeted Retrieval (OKF / RAG)** | 556 ms |
| **Answer Generation (LLM)** | 250 ms |

## 3. Paired System Latency Difference (V2 - V1)

- **Median Difference (V2 - V1):** -306 ms
- **Number of Paired Observations:** 60

