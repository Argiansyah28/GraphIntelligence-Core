package main

import (
	"log"

	"github.com/Argiansyah28/graph-intelligence-api/database"
	"github.com/Argiansyah28/graph-intelligence-api/handlers"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	database.Connect()

	app := fiber.New()
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "active", "message": "Graph Intelligence System is Online"})
	})

	app.Post("/api/actors", handlers.CreateActor)
	app.Get("/api/actors", handlers.GetActors)
	app.Delete("/api/actors/:id", handlers.DeleteActor)

	app.Post("/api/relations", handlers.CreateRelation)
	app.Get("/api/relations", handlers.GetRelations)

	log.Fatal(app.Listen(":8080"))
}
