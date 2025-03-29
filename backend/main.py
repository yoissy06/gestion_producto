from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="gestion_productos"
    )

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

@app.get("/")
def redirect_to_index():
    return RedirectResponse(url="/frontend/index.html")

class Usuario1(BaseModel):
    nombre: str
    usuario: str
    contrasena: str

class Producto(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    usuario_id: int 

class Usuario(BaseModel):
    usuario: str
    contrasena: str 

class ProductoUpdate(BaseModel):
    nombre: str
    descripcion: str
    precio: float


@app.post("/registro")
def registrar_usuario(usuario: Usuario1):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO usuarios (nombre, usuario, contrasena) VALUES (%s, %s, %s)", 
                       (usuario.nombre, usuario.usuario, usuario.contrasena))
        conn.commit()
        return {"mensaje": "Usuario registrado exitosamente"}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

@app.post("/login")
def login_usuario(usuario: Usuario):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM usuarios WHERE usuario = %s", (usuario.usuario,))
    result = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if result and result.get("contrasena") == usuario.contrasena:
        token = f"token-{result['id']}"
        return JSONResponse(content={"mensaje": "Login exitoso", "token": token, "usuario_id": result["id"], "nombre": result["nombre"]})
    
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

@app.get("/productos/{usuario_id}")
def obtener_productos(usuario_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM productos WHERE usuario_id = %s", (usuario_id,))
    productos = cursor.fetchall()
    
    cursor.close()
    conn.close()

    if not productos:
        return JSONResponse(content={"mensaje": "No hay productos para este usuario"}, status_code=404)

    return productos

@app.post("/productos")
def agregar_producto(producto: Producto):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql = "INSERT INTO productos (nombre, descripcion, precio, usuario_id) VALUES (%s, %s, %s, %s)"
    valores = (producto.nombre, producto.descripcion, producto.precio, producto.usuario_id)
    
    cursor.execute(sql, valores)
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return {"mensaje": "Producto agregado exitosamente"}

@app.put("/productos/{id}")
def editar_producto(id: int, producto: ProductoUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE productos SET nombre = %s, descripcion = %s, precio = %s WHERE id = %s",
            (producto.nombre, producto.descripcion, producto.precio, id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        return {"mensaje": "Producto actualizado con éxito"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.delete("/productos/{id}")
def eliminar_producto(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM productos WHERE id = %s", (id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        return {"mensaje": "Producto eliminado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
