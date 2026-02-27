import express from 'express';
import * as promClient from 'prom-client'; 
import { createServer } from 'http'; 

//Abrir servidores de datos para los conteneodres de métricas
const abrirServidorMetricas = (app) => {
    const METRICS_PORT = 9100;
    const metricsApp = express();

    const httpRequestCounter = new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total HTTP requests count, labeled by method, path, and status code',
        labelNames: ['method', 'path', 'status_code'],
    });

    const httpRequestDuration = new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'Duration of HTTP requests in seconds (network performance)',
        labelNames: ['method', 'path'],
        buckets: [0.005, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
    });

    promClient.collectDefaultMetrics();

    app.use((req, res, next) => {
        const end = httpRequestDuration.startTimer();

        res.on('finish', () => {
            const path = req.path;
            const method = req.method;
            const status_code = String(res.statusCode);
            httpRequestCounter.inc({ method, path, status_code });
            end({ method, path });
        });

        next();
    });

    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    metricsApp.get('/metrics', async (req, res) => {
        try {
            const metrics = await promClient.register.metrics();
            res.set('Content-Type', promClient.register.contentType);
            res.end(metrics);
        } catch (ex) {
            console.error("Error generating metrics:", ex);
            res.status(500).end("Internal metrics error.");
        }
    });

    createServer(metricsApp).listen(METRICS_PORT, () => {
        console.log(`[Metrics Server] Exposing metrics internally on port ${METRICS_PORT}.`);
    });
}

export { abrirServidorMetricas }