package models

import (
	"time"

	"github.com/google/uuid"
)

type Actor struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Username  string    `gorm:"unique;not null" json:"username"`
	RiskScore float64   `gorm:"default:0" json:"risk_score"`
	CreatedAt time.Time `json:"created_at"`
}
