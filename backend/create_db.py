import pymysql

def create_database(host="127.0.0.1", user="root", password="zhongxinyi", db_name="aipcvl"):
    # Connect to MySQL server
    try:
        connection = pymysql.connect(
            host=host,
            user=user,
            password=password
        )
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"Database {db_name} created successfully.")
        connection.commit()
    except Exception as e:
        print(f"Error creating database: {e}")
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    create_database()
