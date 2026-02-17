package handlers

import (
	"github.com/Argiansyah28/graph-intelligence-api/database"
	"github.com/Argiansyah28/graph-intelligence-api/models"
	"github.com/gofiber/fiber/v2"
)

func CreateActor(c *fiber.Ctx) error {
	actor := new(models.Actor)
	if err := c.BodyParser(actor); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if err := database.DB.Create(&actor).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create actor"})
	}
	return c.Status(201).JSON(actor)
}

func GetActors(c *fiber.Ctx) error {
	var actors []models.Actor
	database.DB.Find(&actors)
	return c.Status(200).JSON(actors)
}

func DeleteActor(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := database.DB.Delete(&models.Actor{}, "id = ?", id).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not delete actor"})
	}
	return c.SendStatus(204)
}
