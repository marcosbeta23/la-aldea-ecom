import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Devoluciones | La Aldea Agroinsumos y Riego",
  description: "Politica de devoluciones y garantias de La Aldea Agroinsumos y Riego.",
};

export default function PoliticaDevolucionesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Politica de Devoluciones</h1>

      <p className="text-sm text-muted-foreground mb-8">
        Ultima actualizacion: abril de 2026
      </p>

      <section className="space-y-6 text-base leading-relaxed">

        <div>
          <h2 className="text-xl font-semibold mb-2">1. Productos defectuosos</h2>
          <p>
            Aceptamos devoluciones de productos que presenten defectos de fabricacion
            o danos producidos durante el transporte. El cliente debera comunicarse
            con nosotros dentro de los <strong>7 dias corridos</strong> desde la
            recepcion del pedido, indicando el problema y adjuntando fotografias del
            producto.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Como iniciar una devolucion</h2>
          <p>
            Para solicitar una devolucion, envie un correo a{" "}
            <a href="mailto:ventas@laaldeatala.com.uy" className="underline text-primary">
              ventas@laaldeatala.com.uy
            </a>
            {" "}con:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Numero de pedido</li>
            <li>Descripcion del defecto o problema</li>
            <li>Fotografias del producto y del embalaje</li>
          </ul>
          <p className="mt-2">
            Nos comunicaremos dentro de las <strong>48 horas habiles</strong> para
            coordinar el proceso.
          </p>
        </div>

        <div>
            <h2 className="text-xl font-semibold mb-2">3. Devoluciones por arrepentimiento</h2>
            <p>
                Aceptamos devoluciones por arrepentimiento siempre que el producto se encuentre{" "}
                <strong>en su embalaje original, sin abrir y sin uso</strong>. El cliente debera
                comunicarse dentro de los <strong>7 dias corridos</strong> desde la recepcion
                del pedido.
            </p>
            <p className="mt-2">
                No se aceptan devoluciones de productos que hayan sido abiertos, utilizados
                o que no conserven su embalaje original.
            </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Garantia legal</h2>
          <p>
            Todos nuestros productos cuentan con la garantia minima legal establecida
            por la legislacion uruguaya vigente. En caso de productos con garantia de
            fabricante, coordinaremos el contacto con el proveedor correspondiente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Costos de envio</h2>
          <p>
            En caso de devolucion por defecto de fabricacion o error nuestro, los
            costos de envio de retorno corren por nuestra cuenta. En otros casos,
            el costo es responsabilidad del cliente.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Contacto</h2>
          <p>
            Para cualquier consulta sobre devoluciones:{" "}
            <a href="mailto:ventas@laaldeatala.com.uy" className="underline text-primary">
              ventas@laaldeatala.com.uy
            </a>
          </p>
        </div>

      </section>
    </main>
  );
}