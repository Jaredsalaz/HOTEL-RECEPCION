"""
Script para generar hash de contraseña admin
"""
import bcrypt

# Contraseña a hashear
password = "admin123"

# Generar hash
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt()
hashed = bcrypt.hashpw(password_bytes, salt)

print("=" * 60)
print("HASH GENERADO PARA PASSWORD: admin123")
print("=" * 60)
print(f"\nHash: {hashed.decode('utf-8')}")
print("\n" + "=" * 60)
print("QUERY SQL PARA ACTUALIZAR:")
print("=" * 60)
print(f"""
UPDATE administrators 
SET password_hash = '{hashed.decode('utf-8')}'
WHERE id = 1;
""")
print("=" * 60)

# Verificar que funciona
test_password = "admin123"
is_valid = bcrypt.checkpw(test_password.encode('utf-8'), hashed)
print(f"\n✓ Verificación: {'EXITOSA' if is_valid else 'FALLIDA'}")
print("=" * 60)
