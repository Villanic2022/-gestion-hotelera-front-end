// src/pages/FacturasPage.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getFacturas } from "../api/facturas";
import { useToast } from "../context/ToastContext";
import "../styles/crud.css";

export default function FacturasPage() {
    const { showToast } = useToast();
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filtros
    const [filtroTipoComprobante, setFiltroTipoComprobante] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
    const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
    const [filtroBusqueda, setFiltroBusqueda] = useState("");

    // Modal detalle
    const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

    useEffect(() => {
        cargarFacturas();
    }, []);

    async function cargarFacturas() {
        try {
            setLoading(true);
            setError("");
            const data = await getFacturas();
            setFacturas(data);
        } catch (err) {
            console.error("Error cargando facturas:", err);
            setError("Error al cargar el historial de facturas");
            showToast("error", "Error al cargar facturas");
        } finally {
            setLoading(false);
        }
    }

    // Filtrar facturas
    function obtenerFacturasFiltradas() {
        return facturas.filter((f) => {
            // Filtro por tipo comprobante
            if (filtroTipoComprobante && f.tipoComprobante !== filtroTipoComprobante) {
                return false;
            }

            // Filtro por estado
            if (filtroEstado && f.estado !== filtroEstado) {
                return false;
            }

            // Filtro por fecha desde
            if (filtroFechaDesde) {
                const fechaEmision = f.fechaEmision?.split("T")[0];
                if (fechaEmision < filtroFechaDesde) return false;
            }

            // Filtro por fecha hasta
            if (filtroFechaHasta) {
                const fechaEmision = f.fechaEmision?.split("T")[0];
                if (fechaEmision > filtroFechaHasta) return false;
            }

            // Filtro por búsqueda (CAE, documento, reserva)
            if (filtroBusqueda) {
                const busqueda = filtroBusqueda.toLowerCase();
                const coincide =
                    f.cae?.toLowerCase().includes(busqueda) ||
                    f.documentoReceptor?.toLowerCase().includes(busqueda) ||
                    String(f.reservaId).includes(busqueda) ||
                    String(f.numeroComprobante).includes(busqueda);
                if (!coincide) return false;
            }

            return true;
        });
    }

    function limpiarFiltros() {
        setFiltroTipoComprobante("");
        setFiltroEstado("");
        setFiltroFechaDesde("");
        setFiltroFechaHasta("");
        setFiltroBusqueda("");
    }

    // Formatear número de comprobante
    function formatearNumeroComprobante(puntoVenta, numero) {
        return `${String(puntoVenta).padStart(5, '0')}-${String(numero).padStart(8, '0')}`;
    }

    // Formatear fecha
    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        try {
            return new Date(fechaISO).toLocaleString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fechaISO;
        }
    }

    // Formatear fecha corta
    function formatearFechaCorta(fecha) {
        if (!fecha) return "-";
        try {
            // Manejar formato YYYYMMDD o YYYY-MM-DD
            if (fecha.length === 8 && !fecha.includes("-")) {
                const year = fecha.substring(0, 4);
                const month = fecha.substring(4, 6);
                const day = fecha.substring(6, 8);
                return `${day}/${month}/${year}`;
            }
            return new Date(fecha).toLocaleDateString('es-AR');
        } catch {
            return fecha;
        }
    }

    // Calcular totales
    const facturasFiltradas = obtenerFacturasFiltradas();
    const totalImporte = facturasFiltradas.reduce((sum, f) => sum + (f.importeTotal || 0), 0);

    return (
        <Layout>
            <div className="crud-container">
                {/* Header */}
                <div className="crud-header">
                    <div className="crud-header-left">
                        <h1 className="crud-title">
                            <span className="crud-title-icon">🧾</span>
                            Historial de Facturas
                        </h1>
                        <span className="crud-counter">
                            {facturasFiltradas.length} {facturasFiltradas.length === 1 ? 'factura' : 'facturas'}
                        </span>
                    </div>
                    <button className="crud-btn-new" onClick={cargarFacturas} disabled={loading}>
                        <span>🔄</span>
                        {loading ? "Cargando..." : "Actualizar"}
                    </button>
                </div>

                {error && <div className="crud-error">{error}</div>}

                {/* Resumen */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px'
                }}>
                    <div className="crud-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>{facturasFiltradas.length}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Facturas Emitidas</div>
                    </div>
                    <div className="crud-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                            ${totalImporte.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Facturado</div>
                    </div>
                    <div className="crud-card" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                            {facturasFiltradas.filter(f => f.estado === 'APROBADA').length}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Aprobadas</div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="crud-card" style={{ marginBottom: '20px', padding: '20px' }}>
                    <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔍</span> Filtros de búsqueda
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'end' }}>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Buscar</label>
                            <input
                                type="text"
                                value={filtroBusqueda}
                                onChange={(e) => setFiltroBusqueda(e.target.value)}
                                placeholder="CAE, documento, reserva..."
                                className="crud-form-input"
                            />
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Tipo Comprobante</label>
                            <select
                                value={filtroTipoComprobante}
                                onChange={(e) => setFiltroTipoComprobante(e.target.value)}
                                className="crud-form-select"
                            >
                                <option value="">Todos</option>
                                <option value="B">Factura B</option>
                                <option value="C">Factura C</option>
                            </select>
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="crud-form-select"
                            >
                                <option value="">Todos</option>
                                <option value="APROBADA">APROBADA</option>
                                <option value="RECHAZADA">RECHAZADA</option>
                                <option value="PENDIENTE">PENDIENTE</option>
                            </select>
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Fecha desde</label>
                            <input
                                type="date"
                                value={filtroFechaDesde}
                                onChange={(e) => setFiltroFechaDesde(e.target.value)}
                                className="crud-form-input"
                            />
                        </div>
                        <div className="crud-form-group" style={{ marginBottom: 0 }}>
                            <label className="crud-form-label">Fecha hasta</label>
                            <input
                                type="date"
                                value={filtroFechaHasta}
                                onChange={(e) => setFiltroFechaHasta(e.target.value)}
                                className="crud-form-input"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="crud-btn-new"
                        >
                            🔄 Limpiar
                        </button>
                    </div>
                </div>

                {/* Tabla de Facturas */}
                {loading ? (
                    <div className="crud-loading">
                        <div className="crud-loading-spinner"></div>
                        <p>Cargando facturas...</p>
                    </div>
                ) : (
                    <div className="crud-card" style={{ padding: '0', overflow: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '13px'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Nº Comprobante</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Tipo</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Reserva</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Receptor</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Fecha Emisión</th>
                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Importe</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>CAE</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Vto. CAE</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Estado</th>
                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturasFiltradas.map((f) => (
                                    <tr key={f.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937', fontFamily: 'monospace' }}>
                                            {formatearNumeroComprobante(f.puntoVenta, f.numeroComprobante)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: f.tipoComprobante === 'B' ? '#dbeafe' : '#fef3c7',
                                                color: f.tipoComprobante === 'B' ? '#1d4ed8' : '#92400e'
                                            }}>
                                                {f.tipoComprobante}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>
                                            #{f.reservaId}
                                        </td>
                                        <td style={{ padding: '12px', color: '#374151' }}>
                                            <div style={{ fontSize: '12px' }}>
                                                <span style={{ color: '#6b7280' }}>{f.tipoDocumentoReceptor}:</span> {f.documentoReceptor}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#374151', fontSize: '12px' }}>
                                            {formatearFecha(f.fechaEmision)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#10b981', whiteSpace: 'nowrap' }}>
                                            ${f.importeTotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })} {f.moneda}
                                        </td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: f.cae ? '#374151' : '#9ca3af' }}>
                                            {f.cae || '-'}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '12px', color: '#374151' }}>
                                            {formatearFechaCorta(f.caeVencimiento)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span className={`crud-badge ${f.estado === 'APROBADA' ? 'success' : f.estado === 'RECHAZADA' ? 'danger' : 'warning'}`} style={{ fontSize: '11px' }}>
                                                {f.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setFacturaSeleccionada(f)}
                                                className="crud-btn-action"
                                                style={{
                                                    padding: '6px 12px',
                                                    fontSize: '11px',
                                                    backgroundColor: '#6366f1'
                                                }}
                                                title="Ver Detalle"
                                            >
                                                👁️ Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && facturasFiltradas.length === 0 && (
                    <div className="crud-empty">
                        <div className="crud-empty-icon">🧾</div>
                        <p className="crud-empty-text">
                            {facturas.length === 0 ? "No hay facturas emitidas" : "No hay facturas que coincidan con los filtros"}
                        </p>
                    </div>
                )}

                {/* Modal Detalle Factura */}
                {facturaSeleccionada && (
                    <div className="crud-modal-overlay">
                        <div className="crud-modal" style={{ maxWidth: "600px" }}>
                            <div className="crud-modal-header">
                                <h2>🧾 Detalle de Factura</h2>
                                <button className="crud-modal-close" onClick={() => setFacturaSeleccionada(null)}>&times;</button>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {/* Encabezado */}
                                <div style={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Factura</div>
                                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', fontFamily: 'monospace' }}>
                                        {formatearNumeroComprobante(facturaSeleccionada.puntoVenta, facturaSeleccionada.numeroComprobante)}
                                    </div>
                                    <span style={{
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: facturaSeleccionada.tipoComprobante === 'B' ? '#dbeafe' : '#fef3c7',
                                        color: facturaSeleccionada.tipoComprobante === 'B' ? '#1d4ed8' : '#92400e'
                                    }}>
                                        Factura {facturaSeleccionada.tipoComprobante}
                                    </span>
                                </div>

                                {/* Datos */}
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>ID Factura:</span>
                                        <span style={{ color: '#1f2937', fontWeight: '500' }}>{facturaSeleccionada.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Reserva:</span>
                                        <span style={{ color: '#1f2937', fontWeight: '500' }}>#{facturaSeleccionada.reservaId}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>CUIT Emisor:</span>
                                        <span style={{ color: '#1f2937', fontWeight: '500', fontFamily: 'monospace' }}>{facturaSeleccionada.cuitEmisor}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Receptor:</span>
                                        <span style={{ color: '#1f2937', fontWeight: '500' }}>
                                            {facturaSeleccionada.tipoDocumentoReceptor}: {facturaSeleccionada.documentoReceptor}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Fecha Emisión:</span>
                                        <span style={{ color: '#1f2937', fontWeight: '500' }}>{formatearFecha(facturaSeleccionada.fechaEmision)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Importe Total:</span>
                                        <span style={{ color: '#10b981', fontWeight: '700', fontSize: '18px' }}>
                                            ${facturaSeleccionada.importeTotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })} {facturaSeleccionada.moneda}
                                        </span>
                                    </div>

                                    {/* CAE destacado */}
                                    {facturaSeleccionada.cae && (
                                        <div style={{
                                            backgroundColor: '#ecfdf5',
                                            border: '1px solid #a7f3d0',
                                            borderRadius: '10px',
                                            padding: '16px',
                                            marginTop: '8px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: '#065f46', fontSize: '14px', fontWeight: '500' }}>CAE:</span>
                                                <span style={{ color: '#065f46', fontWeight: '700', fontSize: '16px', fontFamily: 'monospace' }}>
                                                    {facturaSeleccionada.cae}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: '#065f46', fontSize: '14px', fontWeight: '500' }}>Vencimiento CAE:</span>
                                                <span style={{ color: '#065f46', fontWeight: '600' }}>
                                                    {formatearFechaCorta(facturaSeleccionada.caeVencimiento)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {!facturaSeleccionada.cae && (
                                        <div style={{
                                            backgroundColor: '#fef3c7',
                                            border: '1px solid #fde68a',
                                            borderRadius: '10px',
                                            padding: '12px',
                                            textAlign: 'center',
                                            color: '#92400e',
                                            fontSize: '14px'
                                        }}>
                                            ⚠️ Esta factura no tiene CAE asignado
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Estado:</span>
                                        <span className={`crud-badge ${facturaSeleccionada.estado === 'APROBADA' ? 'success' : facturaSeleccionada.estado === 'RECHAZADA' ? 'danger' : 'warning'}`}>
                                            {facturaSeleccionada.estado}
                                        </span>
                                    </div>

                                    {facturaSeleccionada.detalle && (
                                        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                                            <span style={{ color: '#6b7280', fontSize: '13px' }}>{facturaSeleccionada.detalle}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="crud-modal-footer">
                                <button type="button" className="crud-btn-submit" onClick={() => setFacturaSeleccionada(null)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
