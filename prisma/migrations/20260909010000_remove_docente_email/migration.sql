-- El acceso docente es mediante el enlace privado del nivel y selección de
-- nombre. El correo ya no se solicita ni se almacena.
ALTER TABLE "Docente" DROP COLUMN "email";
