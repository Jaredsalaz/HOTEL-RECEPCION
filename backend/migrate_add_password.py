"""
Migration script to add password_hash column to guests table
"""
import psycopg2
from psycopg2 import sql

# Database connection parameters
DB_CONFIG = {
    'dbname': 'hotel_db',
    'user': 'postgres',
    'password': 'Neymar18*',
    'host': 'localhost',
    'port': '5432'
}

def run_migration():
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='guests' AND column_name='password_hash'
        """)
        
        if cursor.fetchone():
            print("✓ Column password_hash already exists in guests table")
        else:
            # Add password_hash column
            cursor.execute("ALTER TABLE guests ADD COLUMN password_hash VARCHAR(255);")
            conn.commit()
            print("✓ Successfully added password_hash column to guests table")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"✗ Error executing migration: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Running migration: Add password_hash to guests table")
    print("-" * 50)
    success = run_migration()
    if success:
        print("\n✓ Migration completed successfully!")
    else:
        print("\n✗ Migration failed!")
