package handlers

import (
	"github.com/Argiansyah28/graph-intelligence-api/database"
	"github.com/Argiansyah28/graph-intelligence-api/models"
	"github.com/gofiber/fiber/v2"
)

func CreateRelation(c *fiber.Ctx) error {
	relation := new(models.Relation)

	if err := c.BodyParser(relation); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := database.DB.Create(&relation).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Could not create relation"})
	}

	return c.Status(201).JSON(relation)
}

func GetRelations(c *fiber.Ctx) error {
	var relations []models.Relation
	database.DB.Find(&relations)
	return c.Status(200).JSON(relations)
}
