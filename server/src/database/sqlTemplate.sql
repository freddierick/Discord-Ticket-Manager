CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


CREATE TABLE IF NOT EXISTS tickets (
	ticketID uuid DEFAULT uuid_generate_v4 (),

    owner text NOT NULL,
    name text NOT NULL,
    state text NOT NULL,

    created_at timestamp without time zone DEFAULT now(),

    PRIMARY KEY (ticketID)
);


CREATE TABLE IF NOT EXISTS ticket_comments (
    commentID uuid DEFAULT uuid_generate_v4 (),

    ticketID uuid NOT NULL,
    author text NOT NULL,
    comment text NOT NULL,

    edited boolean DEFAULT false,
    deleted boolean DEFAULT false,

    attachment text[],

    created_at timestamp without time zone DEFAULT now(),

    PRIMARY KEY (commentID),
    FOREIGN KEY (ticketID) REFERENCES tickets (ticketID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ticket_comments_comment_index"
ON ticket_comments USING gin(comment gin_trgm_ops);


-- CREATE TABLE IF NOT EXISTS user_bans (
--     banID uuid DEFAULT uuid_generate_v4 (),

--     userID text NOT NULL,
--     reason text NOT NULL,

--     created_at timestamp without time zone DEFAULT now(),

--     PRIMARY KEY (banID),
-- );