package graphql

import (
	"github.com/graphql-go/graphql"
)

var celebrityType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Celebrity",
	Fields: graphql.Fields{
		"id": &graphql.Field{
			Type: graphql.NewNonNull(graphql.Int),
		},
		"fullName": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
		},
		"nationality": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
		},
		"reqPhotoPath": &graphql.Field{
			Type: graphql.NewNonNull(graphql.String),
		},
	},
})

var celebrityInputType = graphql.NewInputObject(graphql.InputObjectConfig{
	Name: "CelebrityInput",
	Fields: graphql.InputObjectConfigFieldMap{
		"id": &graphql.InputObjectFieldConfig{
			Type: graphql.Int,
		},
		"fullName": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.String),
		},
		"nationality": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.String),
		},
		"reqPhotoPath": &graphql.InputObjectFieldConfig{
			Type: graphql.NewNonNull(graphql.String),
		},
	},
})

var Schema graphql.Schema

func InitSchema() error {
	rootQuery := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"celebrities": &graphql.Field{
				Type:        graphql.NewList(celebrityType),
				Description: "Аналог GET /Celebrities/All",
				Resolve:     resolveAllCelebrities,
			},
			"celebrity": &graphql.Field{
				Type:        celebrityType,
				Description: "Аналог GET /Celebrities/{id}",
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.Int),
					},
				},
				Resolve: resolveCelebrityByID,
			},
		},
	})

	rootMutation := graphql.NewObject(graphql.ObjectConfig{
		Name: "Mutation",
		Fields: graphql.Fields{
			"createCelebrity": &graphql.Field{
				Type:        celebrityType,
				Description: "Аналог POST /Celebrities",
				Args: graphql.FieldConfigArgument{
					"input": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(celebrityInputType),
					},
				},
				Resolve: resolveCreateCelebrity,
			},
			"updateCelebrity": &graphql.Field{
				Type:        celebrityType,
				Description: "Аналог PUT /Celebrities/{id}",
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.Int),
					},
					"input": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(celebrityInputType),
					},
				},
				Resolve: resolveUpdateCelebrity,
			},
			"deleteCelebrity": &graphql.Field{
				Type:        graphql.Boolean,
				Description: "Аналог DELETE /Celebrities/{id}",
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{
						Type: graphql.NewNonNull(graphql.Int),
					},
				},
				Resolve: resolveDeleteCelebrity,
			},
		},
	})

	var err error
	Schema, err = graphql.NewSchema(graphql.SchemaConfig{
		Query:    rootQuery,
		Mutation: rootMutation,
	})
	return err
}
